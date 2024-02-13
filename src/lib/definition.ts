// 1.2

import { ObjectId } from "mongodb";
import { z, infer } from "zod";

// ----------------- Macro? here ------------

// ----------------- Schemas here --------------

// ----------------- Types here --------------

// --------------- MongoDB Schema here ---------------

// ----------------- Interfaces here --------------

export interface State<T> {
  formErrors?: string[];
  fieldErrors?: { [K in keyof T]?: string[] };
  success?: boolean;
}

// ----------------- FORM SCHEMAS HERE --------------

// ----------------- Macro? here ------------

// ----------------- Schemas here --------------

export const Profession = z.enum(["برقکار", "جلوبندساز", "مکانیک", "هیچکدام"]);

export const PartSchema = z.object({
  id: z.string().optional(),
  category: z.string(),
  model: z.array(z.string()),
  usedFor: z.array(z.string()).optional(),
  brand: z.string().optional(),
  properties: z.string().optional(),
  sale: z.object({
    buyPrice: z.number().positive(),
    vat: z.number().positive().min(0, "vat should be at least 0"),
    updatedAt: z.date(),
  }),
  warehouse: z.object({
    stock: z.number(),
    address: z.string().optional(),
    initialStock: z.number(),
    updatedAt: z.date(),
  }),
  description: z.string().optional(),
  notes: z.array(z.string()).optional(),
  imageUrls: z.array(z.string()).min(1, "at least one image is required"),
});

export const OrderStatus = z.enum([
  "در انتظار تایید",
  "تایید شده و در حال ارسال",
  "لغو شده توسط مشتری",
  "رد شده توسط ادمین",
  "تکمیل شده",
  "برگشت خورده",
]);

export const PartFormSchema = z.object({
  category: z.string({ required_error: "نام دسته بندی نامعتبر است" }),
  model: z
    .array(z.string().min(2, { message: "نام مدل نامعتبر است" }))
    .refine((val) => val.length > 0, "حداقل یک مدل وارد کنید"),
  imageFiles: z
    .array(z.object({ value: z.any() }))
    .min(1, "حداقل یک عکس انتخاب کنید"),
  usedFor: z.array(z.string()).optional(),
  properties: z.string().optional(),
  brand: z.string().optional(),
  notes: z.array(z.string()).optional(),
  description: z.string().optional(),
  stock: z.coerce
    .number({
      required_error: "تعداد را وارد کنید",
      invalid_type_error: "فقط اعداد وارد کنید",
    })
    .positive("تعداد نامعتبر است")
    .min(1, "تعداد نامعتبر است"),
  buyPrice: z.coerce
    .number({
      required_error: "قیمت خرید را وارد کنید",
      invalid_type_error: "فقط اعداد وارد کنید",
    })
    .positive("قیمت خرید نامعتبر است"),
  vat: z.coerce
    .number({
      required_error: "درصد برارزش افزوده را وارد کنید",
      invalid_type_error: "فقط اعداد وارد کنید",
    })
    .positive("درصد برارزش افزوده نامعتبر است")
    .min(0, "درصد برارزش افزوده نامعتبر است"),
  address: z.string().optional(),
});

export type PartType = z.infer<typeof PartSchema>;

// ----------------- Types here --------------

// --------------- MongoDB Schema here ---------------

// ----------------- Interfaces here --------------

export interface State<T> {
  formErrors?: string[];
  fieldErrors?: { [K in keyof T]?: string[] };
  success?: boolean;
}

// ----------------- FORM SCHEMAS HERE --------------

export const UserSchema = z.object({
  fullname: z.string(),
  phone: z.string().regex(/^09\d{9}$/, "شماره نامعتبر است."),
  profession: Profession,
  address: z.string(),
});

export const SuggestionSchema = z.array(
  z.object({
    backgroundColor: z.number(),
    imageUrl: z.string(),
    profession: Profession,
    partIds: z.array(z.string()),
  })
);
