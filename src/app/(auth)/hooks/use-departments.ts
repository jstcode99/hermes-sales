"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface Department {
  id: number;
  name: string;
  iso_code: string;
}

interface Municipality {
  id: number;
  department_id: number;
  name: string;
}

export function useDepartments() {
  const supabase = createClient();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");

      if (error) {
        console.error("Error fetching departments:", error);
      } else {
        setDepartments(data || []);
      }
      setIsLoading(false);
    };

    fetchDepartments();
  }, []);

  const getMunicipalities = async (departmentId: number) => {
    setSelectedDepartment(departmentId);
    const { data, error } = await supabase
      .from("municipalities")
      .select("*")
      .eq("department_id", departmentId)
      .order("name");

    if (error) {
      console.error("Error fetching municipalities:", error);
    } else {
      setMunicipalities(data || []);
    }
  };

  return {
    departments,
    municipalities,
    getMunicipalities,
    isLoading,
    selectedDepartment,
  };
}
