"use client";
import { login } from "@/lib/action";
import React from "react";

interface PageProps {
  // Define your props here
}

const Page: React.FC<PageProps> = () => {
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const file = e.currentTarget.file.files[0] as File;
    if (!file) return;
    const data = await file.text();
    console.log(data);
    if (!data) return;
    await login(data);
  };

  return (
    <div className="bg-blue-400 absolute inset-0 flex flex-col justify-center align-middle">
      <form
        className="mx-auto bg-white p-4 rounded-md shadow-md flex flex-col justify-center align-middle"
        onSubmit={onSubmit}
        encType="multipart/form-data"
      >
        <input
          className="mx-auto bg-blue-200"
          type="file"
          name="file"
          accept=".txt"
        />
        <button type="submit">Enter</button>
      </form>
    </div>
  );
};

export default Page;
