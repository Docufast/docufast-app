// Payment gateway integration — structure in place, actual provider call
// still pending confirmation of which gateway we're integrating with.
//
// This function is the single place a real payment API call will go.
// It should return { success: true, paymentUrl } once wired up, so the
// frontend can redirect the customer to a hosted checkout page.

export async function initiatePayment(order) {
  // TODO: replace with real gateway call once integration is confirmed.
  // Expected real shape once wired up:
  //   const response = await gatewayClient.createPaymentLink({
  //     amount: order.quote_amount,
  //     reference: order.id,
  //     customerEmail: ...,
  //   });
  //   return { success: true, paymentUrl: response.paymentUrl };

  return {
    success: false,
    error: "Payment gateway integration is not live yet.",
  };
}
