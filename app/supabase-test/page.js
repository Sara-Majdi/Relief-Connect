"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // for age input
import { supabase } from "@/lib/supabaseClient";

export default function SupabaseTestPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [age, setAge] = useState("");

  // READ test
  const testConnection = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("supabase_test")
      .select("age, created_at")
      .limit(5); // fetch 5 rows
    setResult({ data: data ?? null, error });
    setLoading(false);
  };

  // INSERT test
  const insertAge = async () => {
    if (!age) return alert("Please enter an age");
    setLoading(true);
    const { data, error } = await supabase
      .from("supabase_test")
      .insert([{ age: parseInt(age, 10) }])
      .select(); // return inserted row(s)
    setResult({ data: data ?? null, error });
    setAge("");
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Supabase Test</h1>

      {/* READ test */}
      <p className="text-gray-600 mb-2">
        Click to fetch rows from <code>supabase_test</code>:
      </p>
      <Button onClick={testConnection} disabled={loading} className="mb-6">
        {loading ? "Testing..." : "Fetch Rows"}
      </Button>

      {/* INSERT test */}
      <div className="mb-6">
        <p className="text-gray-600 mb-2">Insert a new age value:</p>
        <div className="flex gap-2">
          <Input
            type="number"
            placeholder="Enter age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
          <Button onClick={insertAge} disabled={loading}>
            {loading ? "Inserting..." : "Insert Age"}
          </Button>
        </div>
      </div>

      {/* Output */}
      <pre className="mt-4 text-sm bg-gray-100 p-3 rounded overflow-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );
}
