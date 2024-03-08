-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 20-02-2024 a las 19:21:51
-- Versión del servidor: 10.4.28-MariaDB
-- Versión de PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `manzanitos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `manzanas`
--

CREATE TABLE `manzanas` (
  `id_manzanas` int(11) NOT NULL,
  `nombre_man` varchar(30) DEFAULT NULL,
  `dir` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `manzanas`
--

INSERT INTO `manzanas` (`id_manzanas`, `nombre_man`, `dir`) VALUES
(1, 'Manzanas rojas', 'Cra 12A #51-98'),
(2, 'Manzanas doradas', 'Cra 10A #95-85'),
(3, 'Manzanas rosadas', 'Cra 14B #63-45'),
(4, 'Manzanas moradas', 'Cra 100 #98-58'),
(5, 'Manzanas naranjas', 'Cra 65 #98-54');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `manzanas_servicios`
--

CREATE TABLE `manzanas_servicios` (
  `fk_manzanas` int(11) DEFAULT NULL,
  `fk_servicios` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `manzanas_servicios`
--

INSERT INTO `manzanas_servicios` (`fk_manzanas`, `fk_servicios`) VALUES
(1, 2),
(1, 4),
(1, 6),
(1, 8),
(2, 1),
(2, 3),
(2, 5),
(2, 7),
(3, 1),
(3, 2),
(3, 5),
(3, 6),
(4, 8),
(4, 7),
(4, 4),
(4, 3),
(5, 1),
(5, 3),
(5, 4),
(5, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `id_servicios` int(11) NOT NULL,
  `nombre_ser` varchar(30) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servicios`
--

INSERT INTO `servicios` (`id_servicios`, `nombre_ser`, `tipo`) VALUES
(1, 'Cine', 'Entretenimiento'),
(2, 'Piscina', 'Deporte'),
(3, 'GYM', 'Deporte'),
(4, 'Cocina', 'Gastronomía'),
(5, 'Librería', 'Entretenimiento'),
(6, 'Lavandería', 'Aseo'),
(7, 'Coser', 'Maquinaría'),
(8, 'Yoga', 'Deporte');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitud`
--

CREATE TABLE `solicitud` (
  `id_solicitud` int(11) NOT NULL,
  `solicitud_usu` int(11) NOT NULL,
  `fecha` datetime NOT NULL,
  `codigoS` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `nombre_usu` varchar(30) DEFAULT NULL,
  `tipo_doc` varchar(5) DEFAULT NULL,
  `doc` int(10) DEFAULT NULL,
  `rol` varchar(10) DEFAULT 'Usuario',
  `fk_manzanas` int(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `nombre_usu`, `tipo_doc`, `doc`, `rol`, `fk_manzanas`) VALUES
(1, 'Anita Monita', 'TI', 1033696505, 'Admin', 4),
(3, 'Yoongi', 'TI', 30993, 'Usuario', 2),
(5, 'Taylor', 'TI', 1313, 'Usuario', 1),
(7, 'Yoongi', 'CC', 123456, 'Usuario', 5);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `manzanas`
--
ALTER TABLE `manzanas`
  ADD PRIMARY KEY (`id_manzanas`);

--
-- Indices de la tabla `manzanas_servicios`
--
ALTER TABLE `manzanas_servicios`
  ADD KEY `fk_manzanas1` (`fk_manzanas`),
  ADD KEY `fk_servicios` (`fk_servicios`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`id_servicios`);

--
-- Indices de la tabla `solicitud`
--
ALTER TABLE `solicitud`
  ADD PRIMARY KEY (`id_solicitud`),
  ADD KEY `solicitud_usu` (`solicitud_usu`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `doc` (`doc`),
  ADD KEY `fk_manzanas` (`fk_manzanas`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `manzanas`
--
ALTER TABLE `manzanas`
  MODIFY `id_manzanas` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id_servicios` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `solicitud`
--
ALTER TABLE `solicitud`
  MODIFY `id_solicitud` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `manzanas_servicios`
--
ALTER TABLE `manzanas_servicios`
  ADD CONSTRAINT `fk_manzanas1` FOREIGN KEY (`fk_manzanas`) REFERENCES `manzanas` (`id_manzanas`),
  ADD CONSTRAINT `fk_servicios` FOREIGN KEY (`fk_servicios`) REFERENCES `servicios` (`id_servicios`);

--
-- Filtros para la tabla `solicitud`
--
ALTER TABLE `solicitud`
  ADD CONSTRAINT `solicitud_usu` FOREIGN KEY (`solicitud_usu`) REFERENCES `usuario` (`id_usuario`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_manzanas` FOREIGN KEY (`fk_manzanas`) REFERENCES `manzanas` (`id_manzanas`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
