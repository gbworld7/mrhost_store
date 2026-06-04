#!/usr/bin/env python3
import os, json, subprocess, shlex, time, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CATALOG_PATH = ROOT / "catalog" / "dronovod_catalog.json"

PG_CONTAINER = os.environ.get("PG_CONTAINER", "hff_ru-postgres-1")
DB_NAME = os.environ.get("DB_NAME", "hff_ru")
AGENT_ID = os.environ.get("AGENT_ID", "dronovodbot")
PUBLIC_BASE_URL = os.environ.get("PUBLIC_BASE_URL", "https://mrhost.asia").rstrip("/")
DRY_RUN = os.environ.get("DRY_RUN", "0") == "1"
REPLACE_EXISTING = os.environ.get("REPLACE_EXISTING", "1") == "1"

def run_psql(sql, capture=True, check=False):
    cmd = ["docker", "exec", "-i", PG_CONTAINER, "psql", "-U", "postgres", "-d", DB_NAME, "-v", "ON_ERROR_STOP=1", "-Atc", sql]
    if DRY_RUN and not sql.strip().lower().startswith(("select", "with")):
        print("DRY SQL>", sql[:1000].replace("\n", " "))
        return ""
    p = subprocess.run(cmd, text=True, input="", stdout=subprocess.PIPE if capture else None, stderr=subprocess.PIPE if capture else None)
    if check and p.returncode != 0:
        raise RuntimeError((p.stderr or p.stdout or "").strip())
    if p.returncode != 0:
        print("psql ERROR:", (p.stderr or p.stdout or "").strip())
    return (p.stdout or "").strip()

def q(s):
    return "'" + str(s).replace("'", "''") + "'"

def cols(table):
    sql = f"""
    select column_name || ':' || data_type
    from information_schema.columns
    where table_schema='public' and table_name={q(table)}
    order by ordinal_position
    """
    out = run_psql(sql)
    res = {}
    for line in out.splitlines():
        if ":" in line:
            k,v=line.split(":",1)
            res[k]=v
    return res

def val_for(col, dtype, value):
    if value is None:
        return "NULL"
    dt = dtype.lower()
    if col in ("created_at","updated_at") and "bigint" in dt:
        return str(int(time.time()*1000))
    if col in ("created_at","updated_at") and ("timestamp" in dt or "time" in dt):
        return "now()"
    if "json" in dt:
        return q(json.dumps(value, ensure_ascii=False)) + "::jsonb"
    if "integer" in dt or "bigint" in dt:
        try: return str(int(value))
        except Exception: return "0"
    if "numeric" in dt or "double" in dt or "real" in dt:
        try: return str(float(value))
        except Exception: return "0"
    if "boolean" in dt:
        return "true" if bool(value) else "false"
    return q(value)

def insert_row(table, data):
    c = cols(table)
    fields = []
    values = []
    for k,v in data.items():
        if k in c:
            fields.append('"' + k + '"')
            values.append(val_for(k, c[k], v))
    sql = f'insert into public.{table} ({", ".join(fields)}) values ({", ".join(values)}) returning id;'
    return run_psql(sql)

def backup_table(table):
    run_psql("""
    create table if not exists public.agent_catalog_restore_backups (
      id bigserial primary key,
      backup_reason text not null,
      table_name text not null,
      agent_id text not null,
      row_json jsonb not null,
      created_at timestamptz not null default now()
    );
    """)
    run_psql(f"""
    insert into public.agent_catalog_restore_backups (backup_reason, table_name, agent_id, row_json)
    select 'before_dronovod_catalog_pack_v2', {q(table)}, {q(AGENT_ID)}, to_jsonb(t)
    from public.{table} t
    where agent_id={q(AGENT_ID)};
    """)

def maybe_delete_existing():
    # Replace only this agent's current store catalog after backup. Telegram and site then see the same fresh catalog.
    for table in ("market_cards", "market_categories"):
        if table in ("market_cards", "market_categories"):
            backup_table(table)
    if REPLACE_EXISTING:
        run_psql(f"delete from public.market_cards where agent_id={q(AGENT_ID)};")
        run_psql(f"delete from public.market_categories where agent_id={q(AGENT_ID)};")

def get_agent():
    return run_psql(f"select id || '|' || agent_id || '|' || enabled from public.agents where agent_id={q(AGENT_ID)} limit 1;")

def main():
    print("== DRONOVOD catalog seed v2 ==")
    print("agent_id=", AGENT_ID)
    print("dry_run=", DRY_RUN, "replace=", REPLACE_EXISTING)
    print("db=", PG_CONTAINER, DB_NAME)
    cat = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))

    agent = get_agent()
    if not agent:
        raise SystemExit(f"agent not found: {AGENT_ID}")
    print("agent:", agent)

    cc = cols("market_categories")
    mc = cols("market_cards")
    print("market_categories columns:", ", ".join(cc.keys()))
    print("market_cards columns:", ", ".join(mc.keys()))

    maybe_delete_existing()

    category_id_by_slug = {}
    for n,c in enumerate(cat["categories"], 1):
        cover_url = f"{PUBLIC_BASE_URL}/assets/dronovod/{c['cover']}"
        meta = {"store":"DRONOVOD","theme":"black-gold-field-tech","agent_id":AGENT_ID,"slug":c["slug"],"cover_url":cover_url}
        data = {
            "agent_id": AGENT_ID,
            "slug": c["slug"],
            "title": c["title"],
            "name": c["title"],
            "summary": c["summary"],
            "description": c["summary"],
            "cover_url": cover_url,
            "image_url": cover_url,
            "sort_order": n,
            "position": n,
            "meta": meta,
            "created_at": None,
            "updated_at": None,
        }
        rid = insert_row("market_categories", data)
        category_id_by_slug[c["slug"]] = rid or c["slug"]
        print("category:", c["slug"], "id=", rid or "n/a")

    for n,it in enumerate(cat["items"], 1):
        img = f"{PUBLIC_BASE_URL}/assets/dronovod/{it['image']}"
        desc = f"{it['title']} — {it['description']}"
        meta = {
            "store":"DRONOVOD",
            "agent_id":AGENT_ID,
            "sku":it["id"],
            "title":it["title"],
            "description":it["description"],
            "category_slug":it["category_slug"],
            "brand":it.get("brand","DRONOVOD"),
            "image_url":img,
            "images":[img],
            "brand_avatar":img,
            "visual_style":"premium black/gold field-ready",
            "source":"dronovod_catalog_pack_v2",
        }
        data = {
            "agent_id": AGENT_ID,
            "slug": it["id"],
            "sku": it["id"],
            "title": it["title"],
            "name": it["title"],
            "description": desc,
            "summary": it["description"],
            "price": it["price"],
            "amount": it["price"],
            "category_id": category_id_by_slug.get(it["category_slug"], it["category_slug"]),
            "category_slug": it["category_slug"],
            "image_url": img,
            "cover_url": img,
            "images": [img],
            "visible": True,
            "is_visible": True,
            "published": True,
            "sort_order": n,
            "position": n,
            "meta": meta,
            "created_at": None,
            "updated_at": None,
        }
        rid = insert_row("market_cards", data)
        print("card:", it["id"], "id=", rid or "n/a")

    print("== counts ==")
    print(run_psql(f"""
      select 'market_categories=' || count(*) from public.market_categories where agent_id={q(AGENT_ID)}
      union all
      select 'market_cards=' || count(*) from public.market_cards where agent_id={q(AGENT_ID)};
    """))

if __name__ == "__main__":
    main()
