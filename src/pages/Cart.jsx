import React from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/store.jsx";

const INR = (usd) => `₹${Math.round(usd * 80)}`;

export default function Cart() {
  const nav = useNavigate();
  const { user, cart, saved, subtotal, clearCart, changeQty, removeFromCart, toggleSave, removeSaved } = useStore();

  return (
    <section className="view">
      <div className="panel">
        <div className="panelHead">
          <h2>Your Cart</h2>
          <div className="rowGap">
            <button className="outline" onClick={clearCart}>Clear Cart</button>
            <button
              className="primary"
              onClick={() => {
                if (!user) return nav("/login");
                alert("Checkout demo ✅ (no payment gateway)");
              }}
            >
              Checkout
            </button>
          </div>
        </div>

        <div className="cartSplit">
          <div>
            <h3 className="sectionTitle">Cart Items</h3>
            <div className="cartList">
              {cart.length === 0 ? (
                <div className="muted">Your cart is empty.</div>
              ) : cart.map(item => (
                <div key={item.id} className="cartItem">
                  <img src={item.image} alt={item.title} />
                  <div>
                    <div className="title">{item.title}</div>
                    <div className="muted">{INR(item.price)} each</div>
                  </div>
                  <div className="actions">
                    <div className="qty">
                      <button onClick={() => changeQty(item.id, -1)}>−</button>
                      <b>{item.qty}</b>
                      <button onClick={() => changeQty(item.id, +1)}>+</button>
                    </div>
                    <button className="linkBtn" onClick={() => toggleSave(item.id, "cart")}>Save for later</button>
                    <button className="linkBtn danger" onClick={() => removeFromCart(item.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="sectionTitle">Saved For Later</h3>
            <div className="cartList">
              {saved.length === 0 ? (
                <div className="muted">No items saved for later.</div>
              ) : saved.map(item => (
                <div key={item.id} className="cartItem">
                  <img src={item.image} alt={item.title} />
                  <div>
                    <div className="title">{item.title}</div>
                    <div className="muted">{INR(item.price)} each</div>
                  </div>
                  <div className="actions">
                    <button className="linkBtn" onClick={() => toggleSave(item.id, "saved")}>Move to cart</button>
                    <button className="linkBtn danger" onClick={() => removeSaved(item.id)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary mt">
              <div className="sumRow"><span className="muted">Subtotal</span><b>{INR(subtotal)}</b></div>
              <div className="sumRow"><span className="muted">Items</span><b>{cart.reduce((s,i)=>s+i.qty,0)}</b></div>
              {!user && <div className="muted small mt8">Login required to checkout.</div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
