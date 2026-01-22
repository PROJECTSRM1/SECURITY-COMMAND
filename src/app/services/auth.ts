import { baseUrl } from "../../utils/constants/config";

export const getAllUsers = async() =>{
    try {
        const response = await fetch(`${baseUrl}/User/getallusers`);
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

export const createEmployee = async (empData:any) => {
  try {
    const response = await fetch(`${baseUrl}/User/createemployee`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(empData)
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("❌ Server validation error:", err);
      throw new Error("Failed to createEmployee");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error createEmployee:", error);
    throw error;
  }
};