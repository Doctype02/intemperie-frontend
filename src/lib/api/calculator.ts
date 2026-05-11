import { request } from "@/lib/api";
import type { ApiResponse, CalculatorResult, CalculatorInput } from "@/types";

export async function calculateEstimate(
  data: CalculatorInput
): Promise<CalculatorResult> {
  const res = await request<ApiResponse<CalculatorResult>>("/calculator", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}
