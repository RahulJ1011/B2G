exports.user = (userId, message) => {
    console.log(`📢 USER ${userId}: ${message}`);
};

exports.superior = (caseData) => {
    console.log(`🚓 SUPERIOR ALERT → Case ${caseData._id}`);
};

exports.judiciary = (caseData) => {
    console.log(`⚖️ JUDICIARY ALERT → Case ${caseData._id}`);
};
