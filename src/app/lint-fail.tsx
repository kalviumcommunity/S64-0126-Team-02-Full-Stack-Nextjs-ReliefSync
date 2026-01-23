export default function LintFail() {
  const a = 1;
  a = 2;
  return <div>{a}</div>;
}
