    await expenseService.create({ description, category, amount });
    await refreshExpenses();
    setValue("gastoDescripcion", "");
    setValue("gastoMonto", "");
    if (message) message.textContent = "Gasto agregado correctamente.";
    showToast("Gasto agregado correctamente.");