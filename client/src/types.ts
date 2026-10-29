// types for the backend

export type Course = string;

export interface Recipe {
  id: string;
  name: string;
  minutes: number;
  course: Course;
  chef: any;
}

export type Chef = {
  chefId: any;
  name: string;
};
