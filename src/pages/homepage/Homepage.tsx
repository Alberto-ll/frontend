import {Link } from "react-router-dom";
import '../../static/css/homepage.css'

export default function Homepage() {

    return (
        <div className="Content-Homepage">
            <main>
                <div className="hero-section">
                    <h1>Alquiler de canchas de futbol de forma rapida y sencilla</h1>
                    <p>Encuentra las mejores canchas de la ciudad y reservalas con un solo click</p>
                    <div className="heroButton">
                        <Link to="/login" className="btn">Tu proximo partido a un click!</Link>
                    </div>
                </div>

                <div className="features-section">
                    <h1>Que ofrecemos?</h1>
                    <div className="cards-container">
                        <div className="card">
                            <h2>Variedad de canchas</h2>
                            <p>Contamos con una amplia variedad de canchas para que elijas la que mejor se adapte a tus necesidades.</p>
                        </div>
                        <div className="card">
                            <h2>Reservas faciles</h2>
                            <p>Nuestra plataforma te permite reservar canchas de manera rapida y sencilla, sin complicaciones.</p>
                        </div>
                        <div className="card">
                            <h2>Tienes un predio o canchas?</h2>
                            <p>Nuestra plataforma permite a los propietarios de canchas publicar sus instalaciones y gestionar reservas de manera sencilla.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>

    );
}