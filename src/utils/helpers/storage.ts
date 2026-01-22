export function getUserDetails(type:any): any | null {
  const user = localStorage.getItem(type);
  return user ? JSON.parse(user) : null;
}

export function setUserDetails(type:any,data:any): any | null {
  return localStorage.setItem(type,JSON.stringify(data));
}