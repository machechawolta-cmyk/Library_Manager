export default function Message({ error, success }) {
  if (error) return <p className="msg error">{error}</p>;
  if (success) return <p className="msg success">{success}</p>;
  return null;
}
