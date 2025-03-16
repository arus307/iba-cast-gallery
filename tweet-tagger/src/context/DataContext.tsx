"use client";

import dayjs from "dayjs";
import {Db} from "../db";
import { createContext, useContext, useState, ReactNode } from 'react';

const DataContext = createContext<Db | undefined>(undefined);
  
export function DataProvider({ jsonString, children }: { jsonString:string, children: ReactNode }) {

  const db = JSON.parse(jsonString, (key,value)=>{
      if(key==='postedAt' && typeof value==='string'){
          return dayjs(value);
      }
      return value;
  }) as Db;

  return (
    <DataContext.Provider value={db}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
