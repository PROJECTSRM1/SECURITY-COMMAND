export type User = {
  id: number;
  first_name: string;
  last_name: string;
  role_id: number | null;
  email: string;
  dept_id: number | null;
  mobile: string;
  age: number | null;
  gender_id: number | null;
  created_by: number | null;
  created_date: string;
  modified_by: number | null;
  modified_date: string | null;
  is_active: boolean;
  location_id: number | null;
  service_id: number | null;

  customer_complaintcreated_byNavigations: any[];
  customer_complaintmodified_byNavigations: any[];
  customer_complaintusers: any[];
  dept: any | null;
  gender: any | null;
  location: any | null;
  role: any | null;
  service: any | null;
  service_bookingcreated_byNavigations: any[];
  service_bookingmodified_byNavigations: any[];
  user_authcreated_byNavigations: any[];
  user_authmodified_byNavigations: any[];
  user_authusers: any[];

  token?: string;
};

export type UserState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};
