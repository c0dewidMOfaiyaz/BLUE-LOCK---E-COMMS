const API = "https://fakestoreapi.com";

export async function getCategories() {
  const res = await fetch(`${API}/products/categories`);
  if (!res.ok) throw new Error("Failed categories");
  return res.json();
}

export async function getProducts() {
  const res = await fetch(`${API}/products`);
  if (!res.ok) throw new Error("Failed products");
  return res.json();
}
