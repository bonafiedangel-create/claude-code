export function Mark({ size = 34 }: { size?: number }) {
  return <img src="/logo-mark.svg" width={size} height={size} alt="" style={{ display: 'block' }} />;
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <Mark />
      <span>
        kernly<b>.</b>
      </span>
    </span>
  );
}
