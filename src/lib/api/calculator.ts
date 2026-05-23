import { request } from "@/lib/api";
import type { CalculatorResult, CalculatorInput } from "@/types";

export async function calculateEstimate(
  data: CalculatorInput
): Promise<CalculatorResult> {
  return request<CalculatorResult>("/calculator/estimate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
