import React, { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  FaUsers,
  FaFutbol,
  FaStore,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaUserShield,
  FaPlus,
  FaList,
  FaUserCog,
  FaRegCheckCircle
} from 'react-icons/fa';
import { useAuth } from '../../hooks/useAuth';
import {
  businessService,
  pitchService,
  userService,
  localityService,
  couponService,
  categoryService
} from '../../services';
import '../../static/css/adminDashboard.css';

interface DashboardStats {
  businesses: number;
  pitches: number;
  users: number;
  localities: number;
  coupons: number;
  categories: number;
}

const AdminDashboard: React.FC = () => {
  const { userData } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    businesses: 0,
    pitches: 0,
    users: 0,
    localities: 0,
    coupons: 0,
    categories: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const [
          businessesRes,
          pitchesRes,
          usersRes,
          localitiesRes,
          couponsRes,
          categoriesRes
        ] = await Promise.allSettled([
          businessService.findAll(),
          pitchService.getAll(),
          userService.findAll(),
          localityService.getAll(),
          couponService.getAll(),
          categoryService.getAll()
        ]);

        if (!isMounted) return;

        setStats({
          businesses: businessesRes.status === 'fulfilled' ? businessesRes.value.length : 0,
          pitches: pitchesRes.status === 'fulfilled' ? pitchesRes.value.length : 0,
          users: usersRes.status === 'fulfilled' ? usersRes.value.length : 0,
          localities: localitiesRes.status === 'fulfilled' ? localitiesRes.value.length : 0,
          coupons: couponsRes.status === 'fulfilled' ? couponsRes.value.length : 0,
          categories: categoriesRes.status === 'fulfilled' ? categoriesRes.value.length : 0
        });
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="admin-dashboard-container">
      {/* Hero / Bienvenida */}
      <div className="admin-dashboard-hero">
        <div className="admin-hero-text">
          <h1>Panel de Administración</h1>
          <p>
            Bienvenido, <strong>{userData?.name || 'Administrador'}</strong>. Control centralizado de recursos y operaciones de FútbolYa.
          </p>
        </div>
        <div className="admin-hero-badge">
          <FaRegCheckCircle /> Modo Administrador
        </div>
      </div>

      {/* Métricas rápidas */}
      <div>
        <h2 className="admin-section-title">
          <FaUserCog /> Resumen General del Sistema
        </h2>
        <div className="admin-metrics-grid">
          <div className="admin-metric-card">
            <div className="admin-metric-icon green">
              <FaStore />
            </div>
            <div className="admin-metric-info">
              <span className="admin-metric-value">{loading ? '...' : stats.businesses}</span>
              <span className="admin-metric-label">Negocios</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon blue">
              <FaFutbol />
            </div>
            <div className="admin-metric-info">
              <span className="admin-metric-value">{loading ? '...' : stats.pitches}</span>
              <span className="admin-metric-label">Canchas</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon orange">
              <FaUsers />
            </div>
            <div className="admin-metric-info">
              <span className="admin-metric-value">{loading ? '...' : stats.users}</span>
              <span className="admin-metric-label">Usuarios</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon purple">
              <FaMapMarkerAlt />
            </div>
            <div className="admin-metric-info">
              <span className="admin-metric-value">{loading ? '...' : stats.localities}</span>
              <span className="admin-metric-label">Localidades</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon red">
              <FaTicketAlt />
            </div>
            <div className="admin-metric-info">
              <span className="admin-metric-value">{loading ? '...' : stats.coupons}</span>
              <span className="admin-metric-label">Cupones</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="admin-metric-icon teal">
              <FaUserShield />
            </div>
            <div className="admin-metric-info">
              <span className="admin-metric-value">{loading ? '...' : stats.categories}</span>
              <span className="admin-metric-label">Categorías</span>
            </div>
          </div>
        </div>
      </div>

      {/* Atajos Rápidos */}
      <div>
        <h2 className="admin-section-title">
          <FaPlus /> Acciones Rápidas
        </h2>
        <div className="admin-actions-bar">
          <Link to="business/create/" className="admin-action-btn">
            <FaPlus /> Nuevo Negocio
          </Link>
          <Link to="pitches/add/" className="admin-action-btn">
            <FaPlus /> Nueva Cancha
          </Link>
          <Link to="users/createUser/" className="admin-action-btn secondary">
            <FaPlus /> Nuevo Usuario
          </Link>
          <Link to="localities/create/" className="admin-action-btn secondary">
            <FaPlus /> Nueva Localidad
          </Link>
          <Link to="coupons/add/" className="admin-action-btn secondary">
            <FaPlus /> Nuevo Cupón
          </Link>
          <Link to="categories/create/" className="admin-action-btn secondary">
            <FaPlus /> Nueva Categoría
          </Link>
        </div>
      </div>

      {/* Hub de Módulos */}
      <div>
        <h2 className="admin-section-title">
          <FaList /> Módulos de Gestión
        </h2>
        <div className="admin-modules-grid">
          {/* Negocios */}
          <div className="admin-module-card">
            <div className="admin-module-header">
              <div className="admin-metric-icon green">
                <FaStore />
              </div>
              <div>
                <h3 className="admin-module-title">Negocios y Complejos</h3>
                <p className="admin-module-description">
                  Gestión integral de predios deportivos, aprobación de altas y revisión de negocios inactivos.
                </p>
              </div>
            </div>
            <div className="admin-module-links">
              <Link to="business/getAll/" className="admin-module-link primary">
                <FaList /> Listado ({stats.businesses})
              </Link>
              <Link to="inactiveBusinesses/getAll/" className="admin-module-link">
                Inactivos
              </Link>
              <Link to="business/create/" className="admin-module-link">
                <FaPlus /> Crear
              </Link>
            </div>
          </div>

          {/* Canchas */}
          <div className="admin-module-card">
            <div className="admin-module-header">
              <div className="admin-metric-icon blue">
                <FaFutbol />
              </div>
              <div>
                <h3 className="admin-module-title">Canchas de Fútbol</h3>
                <p className="admin-module-description">
                  Catálogo de canchas, tipos de suelo, techado, fotos y precios por hora asociados a complejos.
                </p>
              </div>
            </div>
            <div className="admin-module-links">
              <Link to="pitches/getAll/" className="admin-module-link primary">
                <FaList /> Listado ({stats.pitches})
              </Link>
              <Link to="pitches/add/" className="admin-module-link">
                <FaPlus /> Nueva Cancha
              </Link>
            </div>
          </div>

          {/* Usuarios */}
          <div className="admin-module-card">
            <div className="admin-module-header">
              <div className="admin-metric-icon orange">
                <FaUsers />
              </div>
              <div>
                <h3 className="admin-module-title">Usuarios y Clientes</h3>
                <p className="admin-module-description">
                  Control de usuarios registrados, roles asignados, datos de contacto y estado de cuentas.
                </p>
              </div>
            </div>
            <div className="admin-module-links">
              <Link to="users/getAll/" className="admin-module-link primary">
                <FaList /> Listado ({stats.users})
              </Link>
              <Link to="users/createUser/" className="admin-module-link">
                <FaPlus /> Crear Usuario
              </Link>
            </div>
          </div>

          {/* Localidades */}
          <div className="admin-module-card">
            <div className="admin-module-header">
              <div className="admin-metric-icon purple">
                <FaMapMarkerAlt />
              </div>
              <div>
                <h3 className="admin-module-title">Localidades y Zonas</h3>
                <p className="admin-module-description">
                  Ciudades, códigos postales y provincias disponibles para la radicación de predios.
                </p>
              </div>
            </div>
            <div className="admin-module-links">
              <Link to="localities/getAll/" className="admin-module-link primary">
                <FaList /> Listado ({stats.localities})
              </Link>
              <Link to="localities/create/" className="admin-module-link">
                <FaPlus /> Nueva Localidad
              </Link>
            </div>
          </div>

          {/* Cupones */}
          <div className="admin-module-card">
            <div className="admin-module-header">
              <div className="admin-metric-icon red">
                <FaTicketAlt />
              </div>
              <div>
                <h3 className="admin-module-title">Cupones de Descuento</h3>
                <p className="admin-module-description">
                  Promociones, porcentajes de descuento, vigencia y asignación de beneficios para reservas.
                </p>
              </div>
            </div>
            <div className="admin-module-links">
              <Link to="coupons/getAll/" className="admin-module-link primary">
                <FaList /> Listado ({stats.coupons})
              </Link>
              <Link to="coupons/add/" className="admin-module-link">
                <FaPlus /> Crear Cupón
              </Link>
            </div>
          </div>

          {/* Categorías */}
          <div className="admin-module-card">
            <div className="admin-module-header">
              <div className="admin-metric-icon teal">
                <FaUserShield />
              </div>
              <div>
                <h3 className="admin-module-title">Categorías y Permisos</h3>
                <p className="admin-module-description">
                  Definición de roles y privilegios de acceso para usuarios, dueños de negocios y administradores.
                </p>
              </div>
            </div>
            <div className="admin-module-links">
              <Link to="categories/getAll/" className="admin-module-link primary">
                <FaList /> Listado ({stats.categories})
              </Link>
              <Link to="categories/create/" className="admin-module-link">
                <FaPlus /> Nueva Categoría
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;