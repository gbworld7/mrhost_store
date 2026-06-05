import React from "react";
import { useFxRates, priceInCurrency, formatPrice, gbtAmount } from "./useFxRates.js";

export function ProductCardBase({
  item,
  variant = "site",
  onOpenDetail,
  onAddCart,
  style = {},
}) {
  const { rates, loading } = useFxRates();

  const title = item.title || (item.description || "").split("—")[0].trim() || "Untitled";
  const desc = (item.description || "").split("—").slice(1).join("—").trim() || item.description || "";
  
  const usdPrice = parseFloat(item.price) || 0;
  const vndPrice = rates ? priceInCurrency(usdPrice, "VND", rates) : null;
  const gbtValue = gbtAmount(usdPrice);

  return (
    <div style={{
      background: "linear-gradient(180deg,#F9F3E5,#FFFFFF)",
      border: "1px solid #D4AF37",
      borderRadius: 22,
      padding: 16,
      boxShadow: "0 10px 30px rgba(0,0,0,.06)",
      display: "flex",
      flexDirection: "column",
      ...style,
    }}>
      <button
        onClick={() => onOpenDetail?.(item)}
        style={{
          border: "none",
          padding: 0,
          background: "none",
          cursor: "pointer",
        }}
      >
        <div style={{
          width: "100%",
          aspectRatio: "1/1",
          borderRadius: 18,
          overflow: "hidden",
          background: "#fff",
          position: "relative",
          border: "1px solid #E7E7E7",
        }}>
          {item.image && <img src={item.image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        </div>
      </button>

      <h4 style={{
        fontFamily: "system-ui, -apple-system",
        fontWeight: 800,
        fontSize: 23,
        margin: "16px 0 6px",
        letterSpacing: "-.01em",
      }}>
        {title}
      </h4>

      <p style={{
        fontSize: 15,
        color: "#666",
        margin: "0 0 8px",
        lineHeight: 1.4,
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>
        {desc}
      </p>

      <div style={{
        display: "flex",
        alignItems: "baseline",
        gap: 12,
        marginBottom: 16,
        marginTop: "auto",
        flexWrap: "wrap",
      }}>
        <span style={{
          fontFamily: "system-ui, -apple-system",
          fontWeight: 800,
          fontSize: 28,
          color: "#FF6B35",
        }}>
          ${usdPrice}
        </span>
        {vndPrice && (
          <span style={{ fontSize: 13, color: "#888" }}>
            / {formatPrice(vndPrice, "VND")} ₫
          </span>
        )}
        <span style={{ fontSize: 12, color: "#999", marginLeft: "auto" }}>
          +{gbtValue} GBT
        </span>
      </div>

      {variant === "site" && (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onAddCart?.(item)} style={{
            flex: 1,
            padding: "10px 16px",
            background: "#333",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}>
            Add to Cart
          </button>
          <button onClick={() => onOpenDetail?.(item)} style={{
            flex: 1,
            padding: "10px 16px",
            background: "#F5F5F5",
            color: "#333",
            border: "1px solid #DDD",
            borderRadius: 12,
            fontWeight: 600,
            cursor: "pointer",
          }}>
            Details
          </button>
        </div>
      )}

      {variant === "landing" && (
        <button onClick={() => onOpenDetail?.(item)} style={{
          width: "100%",
          padding: "10px 16px",
          background: "#FFA500",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          fontWeight: 600,
          cursor: "pointer",
        }}>
          View Drop
        </button>
      )}
    </div>
  );
}
