import '../../static/css/about.css';

export default function AboutUs() {
    return (
        <div className="Content-About">
            <main>
                <div className="about-hero">
                    <h1>Sobre el Proyecto</h1>
                    <p>Proyecto académico para la materia Desarrollo</p>
                </div>

                <div className="about-content">
                    <div className="about-section">
                        <div className="about-text">
                            <h2>Proyecto Universitario</h2>
                            <p>
                                <strong>FútbolYa</strong> es un proyecto desarrollado como parte de la materia 
                                <strong> Desarrollo</strong> de la facultad. Este trabajo práctico tiene como objetivo 
                                aplicar los conocimientos adquiridos en el curso sobre desarrollo web fullstack.
                            </p>
                            <p>
                                La aplicación simula una plataforma real de alquiler de canchas de fútbol, 
                                permitiendo a los usuarios buscar, reservar y gestionar canchas deportivas 
                                de manera intuitiva y eficiente.
                            </p>
                            <div className="project-details">
                                <h3>📚 Objetivos del Proyecto</h3>
                                <ul>
                                    <li>Desarrollar una aplicación web completa con frontend y backend</li>
                                    <li>Aplicar conceptos de JavaScript moderno (ES6+)</li>
                                    <li>Implementar una API RESTful robusta</li>
                                    <li>Gestionar bases de datos y autenticación de usuarios</li>
                                    <li>Trabajar en equipo utilizando metodologías ágiles</li>
                                </ul>
                            </div>
                        </div>
                        <div className="about-image">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/6/67/UTN_logo.jpg" 
                                 alt="UTN" />
                        </div>
                    </div>

                    <div className="tech-stack">
                        <h2>Tecnologías Utilizadas</h2>
                        <div className="tech-grid">
                            <div className="tech-category">
                                <h3>🖥️ Frontend</h3>
                                <div className="tech-list">
                                    <span className="tech-item">React.js</span>
                                    <span className="tech-item">JavaScript (ES6+)</span>
                                    <span className="tech-item">CSS3</span>
                                    <span className="tech-item">HTML5</span>
                                    <span className="tech-item">React Router</span>
                                </div>
                            </div>
                            <div className="tech-category">
                                <h3>⚙️ Backend</h3>
                                <div className="tech-list">
                                    <span className="tech-item">Node.js</span>
                                    <span className="tech-item">Express.js</span>
                                    <span className="tech-item">PostgreSQL</span>
                                    <span className="tech-item">JWT Authentication</span>
                                    <span className="tech-item">RESTful API</span>
                                </div>
                            </div>
                            <div className="tech-category">
                                <h3>🔧 Herramientas</h3>
                                <div className="tech-list">
                                    <span className="tech-item">Git & GitHub</span>
                                    <span className="tech-item">Postman</span>
                                    <span className="tech-item">VS Code</span>
                                    <span className="tech-item">PostgreSQL</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="learning-objectives">
                        <h2> Contenidos de la Materia</h2>
                        <div className="objectives-grid">
                            <div className="objective-card">
                                <h4>JavaScript</h4>
                                <p>ES6+, async/await, promesas, módulos, manipulación del DOM</p>
                            </div>
                            <div className="objective-card">
                                <h4>Desarrollo Backend</h4>
                                <p>Node.js, Express, bases de datos, APIs REST, autenticación</p>
                            </div>
                            <div className="objective-card">
                                <h4>Desarrollo Frontend</h4>
                                <p>React, componentes, estado, hooks, routing</p>
                            </div>
                            <div className="objective-card">
                                <h4>Bases de Datos</h4>
                                <p>Entidades, Relaciones, SQL</p>
                            </div>
                        </div>
                    </div>

                    <div className="team-section">
                        <h2>👥 Equipo de Desarrollo</h2>
                        <p className="team-description">
                            Este proyecto fue desarrollado por estudiantes de la facultad como trabajo práctico 
                            para la materia <strong>Desarrollo</strong>. El equipo trabajó colaborativamente 
                            aplicando las metodologías y tecnologías aprendidas en el curso.
                        </p>
                        <div className="team-cards">
                            <div className="team-member">
                                <div className="member-photo">
                                    <img src="https://avatars.githubusercontent.com/u/181900782?v=4" 
                                         alt="Estudiante" />
                                </div>
                                <h4>lucianoacosta23</h4>
                                <p className="role">Desarrollador Fullstack</p>
                                <p className="github-link">
                                    <a href="https://github.com/lucianoacosta23">Github</a>
                                </p>
                            </div>
                            <div className="team-member">
                                <div className="member-photo">
                                    <img src="https://github.com/ConstanFinelli.png"
                                         alt="Estudiante" />
                                </div>
                                <h4>ConstanFinelli</h4>
                                <p className="role">Desarrollador Fullstack</p>
                                <p className="github-link">
                                    <a href="https://github.com/ConstanFinelli">Github</a>
                                </p>
                            </div>
                            <div className="team-member">
                                <div className="member-photo">
                                    <img src= "https://github.com/Alberto-ll.png"
                                         alt="Estudiante" />
                                </div>
                                <h4>Alberto-ll</h4>
                                <p className="role">Desarrollador Fullstack</p>
                                <p className="github-link">
                                    <a href="https://github.com/Alberto-ll">Github</a>
                                </p>
                            </div>
                        </div>
                        <div className="github-section">
                                <strong>Repositorios del proyecto</strong> 
                                <a href="#" onClick={(e) => e.preventDefault()} className="repo-link">
                                    Back-end
                                </a>
                                <a href="#" onClick={(e) => e.preventDefault()} className="repo-link">
                                    Front-end
                                </a>
                        </div>
                    </div>

                    <div className="academic-info">
                        <h2>📖 Información Académica</h2>
                        <div className="academic-grid">
                            <div className="academic-card">
                                <h4>Materia</h4>
                                <p>Desarrollo</p>
                            </div>
                            <div className="academic-card">
                                <h4>Carrera</h4>
                                <p>Ingeniería en Sistemas de Información</p>
                            </div>
                            <div className="academic-card">
                                <h4>Universidad</h4>
                                <p>Universidad Tecnologica Nacional</p>
                            </div>
                            <div className="academic-card">
                                <h4>Año</h4>
                                <p>2025</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}