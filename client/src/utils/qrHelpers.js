// Download QR code as image
export const downloadQRCode = (qrToken, memberName) => {
  const canvas = document.getElementById(`qr-${qrToken}`);
  if (canvas) {
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = generateQRFileName('team', memberName);
    link.href = url;
    link.click();
  }
};

// Download event canteen QR code
export const downloadEventQR = (canteenQRToken, eventName) => {
  const canvas = document.getElementById(`event-qr-${canteenQRToken}`);
  if (canvas) {
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const sanitizedName = eventName.replace(/[^a-z0-9]/gi, '_');
    link.download = `${sanitizedName}-Canteen-QR.png`;
    link.href = url;
    link.click();
  }
};

// Download all QR codes (sequential downloads)
export const downloadAllQRCodes = (members, teamName) => {
  members.forEach((member, index) => {
    setTimeout(() => {
      downloadQRCode(member.qrToken, member.name);
    }, index * 500); // Stagger downloads by 500ms
  });
};

// Generate standardized filename for QR codes
export const generateQRFileName = (teamName, memberName) => {
  const sanitizedTeam = teamName.replace(/[^a-z0-9]/gi, '_');
  const sanitizedMember = memberName.replace(/[^a-z0-9]/gi, '_');
  const timestamp = new Date().getTime();
  return `QR_${sanitizedTeam}_${sanitizedMember}_${timestamp}.png`;
};

// Format date for display
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Calculate total fee
export const calculateTotalFee = (memberCount, feePerMember) => {
  return memberCount * feePerMember;
};
