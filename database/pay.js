const pg = require('./index.js').pg;

const updatePayeeBalance = (paymentData, walletId) => {
  pg('balance')
  .where('bal_id', walletId)
  .then(wallet => {
    let updatedAmount = parseFloat(wallet[0].amount) + parseFloat(paymentData.amount_to);
    pg('balance')
    .where('bal_id', walletId)
    .update({
      amount: updatedAmount
    })
    .then(res => res)
  })
}

const updatePayorBalance = (paymentData, walletId) => {
  pg('balance')
  .where('bal_id', walletId)
  .then(wallet => {
    let updatedAmount = parseFloat(wallet[0].amount) - parseFloat(paymentData.amount);
    pg('balance')
    .where('bal_id', walletId)
    .update({
      amount: updatedAmount
    }).then(res => res)
  })
}

const insertUserTransaction = (paymentData, txnId) => {
  let payorId;
  let payeeId;

  pg('balance')
  .where('bal_id', paymentData.wallet_from_id)
  .returning('user_id')
  .then(result => {
    payorId = result[0].user_id;
    pg('balance')
    .where('bal_id', paymentData.wallet_to_id)
    .then(result => {
      payeeId = result[0].user_id;
      pg('users_transactions')
      .returning('txn_id')
      .insert({
        txn_id: txnId,
        payer_id: parseInt(payorId),
        payee_id: parseInt(payeeId)
      }).then(res => res);
    })
  })
}

const pay = (paymentData, cb) => {
  pg('balance')
    .where('bal_id', paymentData.wallet_from_id)
    .then(fromWallet => {
      if (parseFloat(fromWallet[0].amount) >= parseFloat(paymentData.amount)) {
        let transactionData = {
          wallet_from_id: paymentData.wallet_from_id,
          wallet_to_id: paymentData.wallet_to_id,
          currency_from_type: paymentData.currency_from_type,
          currency_to_type: paymentData.currency_to_type,
          amount: paymentData.amount,
          amount_to: paymentData.amount_to,
          note: paymentData.note
        }
        pg('transactions')
        .returning('txn_id')
        .insert(transactionData)
        .then(txnId => {
          insertUserTransaction(paymentData, txnId[0]);
          updatePayeeBalance(paymentData, paymentData.wallet_to_id);
          updatePayorBalance(paymentData, paymentData.wallet_from_id);
          cb(null, txnId[0]);
        })
        .catch(err => cb(err, null));
      }
    })
}

const getTransactionInfo = (transactionId) => {
  let query = `
    SELECT transactions.amount amount, transactions.created_at,
    (SELECT username payer_name FROM users WHERE users.id = users_transactions.payer_id),
    (SELECT phone payer_phone FROM users WHERE users.id = users_transactions.payer_id),
    (SELECT verified payer_verified FROM users WHERE users.id = users_transactions.payer_id),
    (SELECT username payee_name FROM users WHERE users.id = users_transactions.payee_id),
    (SELECT phone payee_phone FROM users WHERE users.id = users_transactions.payee_id),
    (SELECT verified payee_verified FROM users WHERE users.id = users_transactions.payee_id)
    FROM transactions, users_transactions WHERE transactions.txn_id = ${transactionId}
    AND transactions.txn_id = users_transactions.txn_id
  `;
  return pg.raw(query).then(res => res.rows[0]);
}

module.exports = {
  pay: pay,
  getTransactionInfo: getTransactionInfo
}