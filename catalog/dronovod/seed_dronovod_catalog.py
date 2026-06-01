#!/usr/bin/env python3
import json, os, subprocess, sys, uuid, time, shlex
from pathlib import Path

AGENT_ID = os.environ.get('AGENT_ID', 'dronovodbot')
PG_CONTAINER = os.environ.get('PG_CONTAINER', 'hff_ru-postgres-1')
DB_NAME = os.environ.get('DB_NAME', 'hff_ru')
PUBLIC_BASE_URL = os.environ.get('PUBLIC_BASE_URL', 'https://mrhost.asia').rstrip('/')
REPLACE_EXISTING = os.environ.get('REPLACE_EXISTING', '1') == '1'
DRY_RUN = '--dry-run' in sys.argv
ROOT = Path(__file__).resolve().parent
CATALOG_PATH = ROOT / 'dronovod_catalog.json'

def run_psql(sql, capture=False):
    if DRY_RUN:
        print('DRY SQL>', ' '.join(sql.split())[:1200])
        return ''
    cmd = ['docker','exec','-i',PG_CONTAINER,'psql','-U','postgres','-d',DB_NAME,'-v','ON_ERROR_STOP=1','-At','-F','\t']
    p = subprocess.run(cmd, input=sql, text=True, capture_output=True)
    if p.returncode != 0:
        print('psql ERROR:', p.stderr.strip(), file=sys.stderr)
        raise SystemExit(p.returncode)
    return p.stdout if capture else ''

def psql_scalar(sql):
    cmd = ['docker','exec','-i',PG_CONTAINER,'psql','-U','postgres','-d',DB_NAME,'-At','-F','\t']
    p = subprocess.run(cmd, input=sql, text=True, capture_output=True)
    if p.returncode != 0:
        print('psql ERROR:', p.stderr.strip(), file=sys.stderr)
        raise SystemExit(p.returncode)
    return p.stdout.strip()

def q(s):
    if s is None: return 'NULL'
    return "'" + str(s).replace("'", "''") + "'"

def qjson(obj):
    return q(json.dumps(obj, ensure_ascii=False)) + '::jsonb'

def cols(table):
    out = psql_scalar(f"""
    select column_name || ':' || data_type
    from information_schema.columns
    where table_schema='public' and table_name='{table}'
    order by ordinal_position;
    """)
    d = {}
    for line in out.splitlines():
        if ':' in line:
            k,v = line.split(':',1); d[k]=v
    return d

def value_for_id(dtype, val):
    if dtype == 'uuid': return q(str(val))
    if dtype in ('integer','bigint','numeric'): return q(str(val.int % 2147483647))
    return q(str(val))

def time_value(dtype):
    if dtype == 'bigint': return str(int(time.time()*1000))
    if dtype in ('integer','numeric'): return str(int(time.time()))
    if 'timestamp' in dtype: return 'now()'
    return q(str(int(time.time()*1000)))

def first_existing(columns, names):
    return [n for n in names if n in columns]

catalog = json.loads(CATALOG_PATH.read_text())
cat_cols = cols('market_categories')
card_cols = cols('market_cards')
print('== DRONOVOD catalog seed v4 ==')
print('agent_id=', AGENT_ID, 'dry_run=', DRY_RUN, 'replace=', REPLACE_EXISTING)
print('market_categories:', cat_cols)
print('market_cards:', card_cols)
agent = psql_scalar(f"select id || '|' || agent_id || '|' || enabled from public.agents where agent_id={q(AGENT_ID)} limit 1;")
if not agent:
    raise SystemExit(f'Agent not found: {AGENT_ID}')
print('agent:', agent)

# Backup table compatible with old versions: create if missing, then insert only existing/common columns.
run_psql("""
create table if not exists public.agent_catalog_restore_backups (
  id bigserial primary key,
  backup_reason text not null,
  table_name text not null,
  row_json jsonb not null,
  created_at timestamptz not null default now()
);
""")
# Add agent_id if table already exists without it; harmless if already present.
run_psql("alter table public.agent_catalog_restore_backups add column if not exists agent_id text;")
for tbl in ['market_cards','market_categories']:
    run_psql(f"""
    insert into public.agent_catalog_restore_backups (backup_reason, table_name, agent_id, row_json)
    select 'before_dronovod_catalog_pack_v4', '{tbl}', {q(AGENT_ID)}, to_jsonb(t)
    from public.{tbl} t
    where agent_id={q(AGENT_ID)};
    """)

if REPLACE_EXISTING:
    run_psql(f"delete from public.market_cards where agent_id={q(AGENT_ID)};")
    run_psql(f"delete from public.market_categories where agent_id={q(AGENT_ID)};")

cat_id_by_slug = {}
for c in catalog['categories']:
    cid = uuid.uuid4()
    cat_id_by_slug[c['slug']] = str(cid)
    meta = {"store":"DRONOVOD","theme":"black-gold-field-tech","agent_id":AGENT_ID,"slug":c['slug'],"cover_url":f"{PUBLIC_BASE_URL}/assets/dronovod/{c['cover']}"}
    vals = {}
    if 'id' in cat_cols: vals['id'] = value_for_id(cat_cols['id'], cid)
    if 'agent_id' in cat_cols: vals['agent_id'] = q(AGENT_ID)
    if 'slug' in cat_cols: vals['slug'] = q(c['slug'])
    if 'title' in cat_cols: vals['title'] = q(c['title'])
    if 'summary' in cat_cols: vals['summary'] = q(c['summary'])
    if 'brief' in cat_cols: vals['brief'] = q(c['summary'])
    if 'cover_url' in cat_cols: vals['cover_url'] = q(f"{PUBLIC_BASE_URL}/assets/dronovod/{c['cover']}")
    if 'media' in cat_cols: vals['media'] = qjson({"cover_url": f"{PUBLIC_BASE_URL}/assets/dronovod/{c['cover']}"}) if cat_cols['media'] in ('json','jsonb') else q(f"{PUBLIC_BASE_URL}/assets/dronovod/{c['cover']}")
    if 'meta' in cat_cols: vals['meta'] = qjson(meta) if cat_cols['meta'] in ('json','jsonb') else q(json.dumps(meta))
    if 'sort_order' in cat_cols: vals['sort_order'] = str(c.get('sort_order', 0))
    if 'created_at' in cat_cols: vals['created_at'] = time_value(cat_cols['created_at'])
    if 'updated_at' in cat_cols: vals['updated_at'] = time_value(cat_cols['updated_at'])
    columns = ', '.join(f'"{k}"' for k in vals)
    values = ', '.join(vals.values())
    sql = f'insert into public.market_categories ({columns}) values ({values}) returning id;'
    # We provide the category UUID explicitly, so keep the generated UUID as the source of truth.
    # psql may append command status like "INSERT 0 1" after RETURNING output; do not use the last line.
    out = run_psql(sql, capture=True).strip() if not DRY_RUN else ''
    if out:
        lines = [x.strip() for x in out.splitlines() if x.strip()]
        if lines:
            print('category sql returned:', lines[0])
    print('category:', c['slug'], 'id=', cat_id_by_slug[c['slug']])

for item in catalog['cards']:
    card_id = uuid.uuid4()
    image_url = f"{PUBLIC_BASE_URL}/assets/dronovod/{item['image']}"
    full_desc = f"{item['title']} — {item['description']}"
    meta = {
        "store":"DRONOVOD", "agent_id":AGENT_ID, "sku":item['sku'], "title":item['title'],
        "description":item['description'], "category_slug":item['category'], "brand":item['brand'],
        "image_url":image_url, "images":[image_url], "brand_avatar":image_url,
        "visual_style":"premium black/gold field-ready", "source":"dronovod_catalog_pack_v4"
    }
    vals = {}
    if 'id' in card_cols: vals['id'] = value_for_id(card_cols['id'], card_id)
    if 'agent_id' in card_cols: vals['agent_id'] = q(AGENT_ID)
    if 'description' in card_cols: vals['description'] = q(full_desc)
    if 'price' in card_cols: vals['price'] = q(item['price'])
    if 'category_id' in card_cols: vals['category_id'] = q(cat_id_by_slug[item['category']])
    if 'images' in card_cols: vals['images'] = qjson([image_url]) if card_cols['images'] in ('json','jsonb') else q(json.dumps([image_url]))
    if 'visible' in card_cols: vals['visible'] = 'true'
    if 'meta' in card_cols: vals['meta'] = qjson(meta) if card_cols['meta'] in ('json','jsonb') else q(json.dumps(meta))
    if 'booking' in card_cols: vals['booking'] = qjson({"enabled": False, "deposit_percent": 50, "slots": []}) if card_cols['booking'] in ('json','jsonb') else q(json.dumps({"enabled": False, "deposit_percent": 50, "slots": []}))
    if 'video' in card_cols: vals['video'] = q('')
    if 'files' in card_cols: vals['files'] = qjson([]) if card_cols['files'] in ('json','jsonb') else q('[]')
    if 'created_at' in card_cols: vals['created_at'] = time_value(card_cols['created_at'])
    if 'updated_at' in card_cols: vals['updated_at'] = time_value(card_cols['updated_at'])
    columns = ', '.join(f'"{k}"' for k in vals)
    values = ', '.join(vals.values())
    sql = f'insert into public.market_cards ({columns}) values ({values}) returning id;'
    out = run_psql(sql, capture=True).strip() if not DRY_RUN else ''
    returned_id = 'n/a'
    if out:
        for line in out.splitlines():
            line = line.strip()
            if len(line) == 36 and line.count('-') == 4:
                returned_id = line
                break
        if returned_id == 'n/a':
            returned_id = out.splitlines()[0].strip()
    print('card:', item['sku'], 'id=', returned_id)

if not DRY_RUN:
    print('== final counts ==')
    print(psql_scalar(f"select 'market_categories=' || count(*) from public.market_categories where agent_id={q(AGENT_ID)};"))
    print(psql_scalar(f"select 'market_cards=' || count(*) from public.market_cards where agent_id={q(AGENT_ID)};"))
