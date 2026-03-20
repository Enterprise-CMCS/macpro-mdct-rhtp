import { ReactNode } from "react";

export interface DateShape {
  year: number;
  month: number;
  day: number;
}

export interface TableContentShape {
  caption?: string;
  headRow?: string[];
  bodyRows?: string[][];
  footRow?: string[][];
}

export interface ErrorVerbiage {
  title: string;
  children: ReactNode;
}
