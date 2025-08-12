export type LoginResponse = {
  statusCode: number;
  data: {
    user: {
      id: number;
      username: string;
      role: string;
      email: string | null;
      phone: string | null;
      isActive: boolean;
    };
  };
  message: string;
  status: boolean;
};

export type TablesResponse = {
  statusCode: number;
  data: any[];
  message: string;
  status: boolean;
};
