export async function POST(request: Request) {
  const { plan } = await request.json();
  return Response.json({
    url: `https://checkout.stripe.com/pay/mock_session_${plan}`,
  });
}
