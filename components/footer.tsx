import Link from "next/link";

const CITIES = ["Podgorica", "Budva", "Tivat", "Nikšić", "Bar", "Kotor"];
const CATS = ["Marketing", "Ugostiteljstvo", "Eventi", "IT", "Administracija", "Prodaja"];

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap foot-grid">
        <div>
          <Link className="brand footer-brand" href="/">
            <span className="mark">ip</span>
            <span>imaposla.me</span>
          </Link>
          <p>Platforma za oglase, prijave i jednostavnije zapošljavanje u Crnoj Gori.</p>
          <p style={{ marginTop: 12, fontSize: 12 }}>© 2026 imaposla.me</p>
        </div>
        <div>
          <h4>Gradovi</h4>
          {CITIES.map(c => <Link key={c} href={`/gradovi/${encodeURIComponent(c.toLowerCase())}`}>Poslovi {c}</Link>)}
        </div>
        <div>
          <h4>Kategorije</h4>
          {CATS.map(c => <Link key={c} href={`/kategorije/${encodeURIComponent(c.toLowerCase())}`}>{c}</Link>)}
        </div>
        <div>
          <h4>Firma</h4>
          <Link href="/za-firme">Za firme</Link>
          <Link href="/firma/novi-oglas">Novi oglas</Link>
          <Link href="/firma/selekcija">ATS selekcija</Link>
          <h4 style={{ marginTop: 16 }}>Pravno</h4>
          <Link href="/privatnost">Privatnost</Link>
          <Link href="/uslovi-koriscenja">Uslovi korišćenja</Link>
        </div>
      </div>
    </footer>
  );
}
