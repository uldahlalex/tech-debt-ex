import type { Course } from "./types";

export const API = "http://127.0.0.1:5150/";
export const PAGE_SIZE = 10;

export function courseName(c: Course) {
  if (c == "Starter") return "Starter";
  if (c == "MainCourse") return "Main course";
  if (c == "Dessert") return "Dessert";
  if (c == "Drink") return "Drink";
  return c;
}

export function validateName(name: string) {
  if (name.length > 150) {
    return "Name too long (max 150)";
  }
  return null;
}

// small helper so we don't need fetch everywhere
export function request(method: string, url: string, body: any, cb: (err: any, data?: any) => void) {
  const xhr = new XMLHttpRequest();
  xhr.open(method, url);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.onload = () => {
    let data;
    try {
      data = JSON.parse(xhr.responseText);
    } catch {
      data = null;
    }
    if (xhr.status >= 400) cb(data);
    else cb(null, data);
  };
  xhr.onerror = () => cb("network error");
  xhr.send(body ? JSON.stringify(body) : null);
}
