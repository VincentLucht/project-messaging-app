export interface ExpressError {
  type?: string;
  value?: string;
  msg: string;
  message?: string;
  path?: 'name' | 'password';
  location?: 'body';
}

export interface ExpressErrors {
  errors: ExpressError[];
  message?: string;
}
