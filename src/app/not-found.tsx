import Link from "next/link";
export default function NotFound(){return <div className="container error-page"><span className="eyebrow">PAGE NOT FOUND</span><h1>A new direction?</h1><p>We couldn’t find that page. The learning library is a good place to pick up your journey.</p><Link href="/learn" className="button button-primary">Explore the learning library</Link></div>;}
