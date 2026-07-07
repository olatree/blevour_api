const FeeAccount = require("../../../models/fees/FeeAccount");
const Term = require("../../../models/Term");
const Session = require("../../../models/Session");

const getPreviousTermAndSession = async (currentTerm) => {
  if (!currentTerm) return null;

  if (currentTerm.name === "2nd Term") {
    const prevTerm = await Term.findOne({
      session: currentTerm.session,
      name: "1st Term",
    });

    if (!prevTerm) return null;

    return {
      sessionId: currentTerm.session,
      termId: prevTerm._id,
    };
  }

  if (currentTerm.name === "3rd Term") {
    const prevTerm = await Term.findOne({
      session: currentTerm.session,
      name: "2nd Term",
    });

    if (!prevTerm) return null;

    return {
      sessionId: currentTerm.session,
      termId: prevTerm._id,
    };
  }

  if (currentTerm.name === "1st Term") {
    const currentSession = await Session.findById(currentTerm.session);

    if (!currentSession) return null;

    const previousSession = await Session.findOne({
      createdAt: { $lt: currentSession.createdAt },
    }).sort({ createdAt: -1 });

    if (!previousSession) return null;

    const prevThirdTerm = await Term.findOne({
      session: previousSession._id,
      name: "3rd Term",
    });

    if (!prevThirdTerm) return null;

    return {
      sessionId: previousSession._id,
      termId: prevThirdTerm._id,
    };
  }

  return null;
};

const getPreviousBalance = async ({ studentId, currentTerm }) => {
  const previousContext = await getPreviousTermAndSession(currentTerm);

  if (!previousContext) {
    return {
      previousBalance: 0,
      previousFeeAccountId: null,
    };
  }

  const previousAccount = await FeeAccount.findOne({
    studentId,
    sessionId: previousContext.sessionId,
    termId: previousContext.termId,
  });

  if (!previousAccount || Number(previousAccount.totalDue || 0) <= 0) {
    return {
      previousBalance: 0,
      previousFeeAccountId: null,
    };
  }

  return {
    previousBalance: Number(previousAccount.totalDue || 0),
    previousFeeAccountId: previousAccount._id,
  };
};

module.exports = {
  getPreviousTermAndSession,
  getPreviousBalance,
};