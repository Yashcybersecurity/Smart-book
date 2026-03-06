async function main() {
  const res = await fetch('http://localhost:3000/?__nextError=1');
  const html = await res.text();

  const marker = 'id="__NEXT_DATA__"';
  const i = html.indexOf(marker);
  if (i < 0) {
    console.log('no __NEXT_DATA__ found');
    process.exit(0);
  }

  const gt = html.indexOf('>', i);
  const end = html.indexOf('</script>', gt);
  const jsonText = html.slice(gt + 1, end);
  const data = JSON.parse(jsonText);

  console.log('status', res.status);
  console.log('err.name', data?.err?.name);
  console.log('err.message', data?.err?.message);
  const stack = String(data?.err?.stack || '');
  console.log('err.stack.head');
  console.log(stack.split('\n').slice(0, 18).join('\n'));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

