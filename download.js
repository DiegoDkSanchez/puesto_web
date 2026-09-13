(() => {
  const establishmentId = new URLSearchParams(window.location.search).get('establishmentId');
  // IDs are opaque: reject empty/whitespace-only values, but never trim a valid ID.
  // URLSearchParams decodes once; encode that exact value as one path segment.
  if (establishmentId === null || establishmentId.trim().length === 0) return;

  const link = document.getElementById('open-establishment');
  link.href = `puesto://app/establishment/${encodeURIComponent(establishmentId)}`;
  document.getElementById('establishment-actions').hidden = false;
})();
