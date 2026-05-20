import { NextRequest, NextResponse } from "next/server";

const TPAY_ENV_URL = "https://app.tilopay.com/api/v1/";

async function getAccessToken(): Promise<string> {
  const res = await fetch(`${TPAY_ENV_URL}login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email:    process.env.TILOPAY_API_USER,
      password: process.env.TILOPAY_API_PASSWORD,
    }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tilopay auth failed: ${res.status} — ${text}`);
  }
  const data = await res.json();
  if (!data.access_token) throw new Error("Tilopay: no access_token in response");
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    if (
      !process.env.TILOPAY_API_USER ||
      !process.env.TILOPAY_API_PASSWORD ||
      !process.env.TILOPAY_INTEGRATION_KEY
    ) {
      return NextResponse.json(
        { error: "Tilopay credentials not configured on server" },
        { status: 503 }
      );
    }

    const { orderNumber, amount, billingInfo } = await req.json() as {
      orderNumber: string;
      amount: number;
      billingInfo: {
        name: string;
        email: string;
        phone: string;
        street: string;
        city: string;
        province: string;
      };
    };

    if (!orderNumber || !amount || !billingInfo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const token = await getAccessToken();

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://intemperie.com.pa";
    const nameParts = billingInfo.name.trim().split(" ");
    const firstName = nameParts[0] ?? "Cliente";
    const lastName  = nameParts.slice(1).join(" ") || firstName;

    const paymentRes = await fetch(`${TPAY_ENV_URL}processPayment`, {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Accept-Language": "es",
      },
      body: JSON.stringify({
        redirect:          1,
        key:               process.env.TILOPAY_INTEGRATION_KEY,
        amount:            Number(amount).toFixed(2),
        currency:          "USD",
        billToFirstName:   firstName,
        billToLastName:    lastName,
        billToAddress:     billingInfo.street  || "N/A",
        billToAddress2:    "",
        billToCity:        billingInfo.city     || "Panamá",
        billToState:       billingInfo.province || "Panamá",
        billToZipPostCode: "00000",
        billToCountry:     "PA",
        billToTelephone:   billingInfo.phone   || "50760000000",
        billToEmail:       billingInfo.email   || "cliente@intemperie.com.pa",
        orderNumber,
        capture:           1,
        subscription:      0,
        platform:          "NextJS",
        lang:              "es",
        hashVersion:       "V2",
        returnData:        `${siteUrl}/checkout/tilopay-return`,
      }),
      cache: "no-store",
    });

    const raw = await paymentRes.text();
    let data: Record<string, unknown>;
    try {
      data = JSON.parse(raw);
    } catch {
      throw new Error(`Tilopay returned non-JSON: ${raw.slice(0, 200)}`);
    }

    if (!paymentRes.ok) {
      return NextResponse.json(
        { error: (data?.message as string) ?? "Tilopay error", details: data },
        { status: paymentRes.status }
      );
    }

    if (typeof data.url === "string") {
      return NextResponse.json({ url: data.url });
    }

    return NextResponse.json(
      { error: "Tilopay did not return a redirect URL", details: data },
      { status: 500 }
    );
  } catch (err) {
    console.error("[Tilopay API]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Payment processing error" },
      { status: 500 }
    );
  }
}
