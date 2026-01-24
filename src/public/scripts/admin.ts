const deleteProduct = (btn: HTMLButtonElement) => {
  const parentNode = btn.parentNode as HTMLElement;
  if (!parentNode) {
    console.error("Button parent node not found");
    return;
  }
  const prodIdInput = parentNode.querySelector(
    "[name=productId]",
  ) as HTMLInputElement;
  const csrfInput = parentNode.querySelector(
    "[name=_csrf]",
  ) as HTMLInputElement;

  if (!prodIdInput || !csrfInput) {
    console.error("Required form inputs not found");
    return;
  }

  const prodId: string = prodIdInput.value;
  const csrf: string = csrfInput.value;

  const productElement = btn.closest("article") as HTMLElement;
  if (!productElement) {
    console.error("Porduct Element node not found");
    return;
  }

  fetch("/admin/product/" + prodId, {
    method: "DELETE",
    headers: {
      "csrf-token": csrf,
    },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      console.log(data);
      if (productElement.parentNode) {
        productElement.parentNode.removeChild(productElement);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
