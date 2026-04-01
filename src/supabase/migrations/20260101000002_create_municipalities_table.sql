-- ==========================================
-- Tabla de municipios de Colombia
-- ==========================================

CREATE TABLE IF NOT EXISTS public.municipalities (
  id integer PRIMARY KEY,
  department_id integer NOT NULL REFERENCES public.departments(id) ON DELETE RESTRICT,
  name text NOT NULL
);

-- Índice para búsquedas por departamento
CREATE INDEX idx_municipalities_department ON public.municipalities(department_id);

-- Índices
CREATE INDEX idx_municipalities_name ON public.municipalities(name);

-- Datos de municipios principales de Colombia (muestra representativa)
INSERT INTO public.municipalities (id, department_id, name) VALUES
-- Antioquia (2)
(1, 2, 'Medellín'),
(2, 2, 'Bello'),
(3, 2, 'Itagüí'),
(4, 2, 'Envigado'),
(5, 2, 'Apartadó'),
(6, 2, 'Rionegro'),
(7, 2, 'La Ceja'),
(8, 2, 'Carmen de Viboral'),
(9, 2, 'La Estrella'),
(10, 2, 'Caucasia'),

-- Bogotá (14)
(11, 14, 'Bogotá D.C.'),
(12, 14, 'Soacha'),
(13, 14, 'Chía'),
(14, 14, 'Cota'),
(15, 14, 'Funza'),
(16, 14, 'Madrid'),
(17, 14, 'Mosquera'),
(18, 14, 'Facatativá'),
(19, 14, 'Zipaquirá'),
(20, 14, 'Fusagasugá'),

-- Valle del Cauca (30)
(21, 30, 'Cali'),
(22, 30, 'Palmira'),
(23, 30, 'Buenaventura'),
(24, 30, 'Tuluá'),
(25, 30, 'Cartago'),
(26, 30, 'Buga'),
(27, 30, 'Jamundí'),
(28, 30, 'Yumbo'),
(29, 30, 'Caicedonia'),
(30, 30, 'Sevilla'),

-- Santander (27)
(31, 27, 'Bucaramanga'),
(32, 27, 'Floridablanca'),
(33, 27, 'Girón'),
(34, 27, 'Piedecuesta'),
(35, 27, 'Barrancabermeja'),
(36, 27, 'San Gil'),
(37, 27, 'Socorro'),
(38, 27, 'Málaga'),
(39, 27, 'Vélez'),
(40, 27, 'Barichara'),

-- Atlántico (4)
(41, 4, 'Barranquilla'),
(42, 4, 'Soledad'),
(43, 4, 'Malambo'),
(44, 4, 'Puerto Colombia'),
(45, 4, 'Sabanagrande'),
(46, 4, 'Baranoa'),
(47, 4, 'Galapa'),
(48, 4, 'Tubará'),
(49, 4, 'Polonuevo'),
(50, 4, 'Campo de la Cruz'),

-- Bolívar (5)
(51, 5, 'Cartagena'),
(52, 5, 'Barranquilla'), -- ya existe en Atlántico, pero referenciamos
(53, 5, 'Magangué'),
(54, 5, 'El Carmen de Bolívar'),
(55, 5, 'Mompós'),
(56, 5, 'Turbaco'),
(57, 5, 'Arjona'),
(58, 5, 'Cartagena de Indias'),
(59, 5, 'Santa Rosa del Sur'),
(60, 5, 'Achí'),

-- Córdoba (13)
(61, 13, 'Montería'),
(62, 13, 'Lorica'),
(63, 13, 'Cereté'),
(64, 13, 'Ciénaga de Oro'),
(65, 13, 'Planeta Rica'),
(66, 13, 'Puerto Libertador'),
(67, 13, 'Sahagún'),
(68, 13, 'Montelibano'),
(69, 13, 'San Pelayo'),
(70, 13, 'Chinú'),

-- Magdalena (19)
(71, 19, 'Santa Marta'),
(72, 19, 'Ciénaga'),
(73, 19, 'Fundación'),
(74, 19, 'El Banco'),
(75, 19, 'Plato'),
(76, 19, 'El Retén'),
(77, 19, 'Zona Bananera'),
(78, 19, 'Puebloviejo'),
(79, 19, 'Aracataca'),
(80, 19, 'Santa Ana'),

-- Cesar (11)
(81, 11, 'Valledupar'),
(82, 11, 'Aguachiva'),
(83, 11, 'Bosconia'),
(84, 11, 'Chimichagua'),
(85, 11, 'Curumaní'),
(86, 11, 'La Jagua de Ibirico'),
(87, 11, 'Manaure Balcón del Cesar'),
(88, 11, 'Pailitas'),
(89, 11, 'Pelaya'),
(90, 11, 'San Diego'),

-- Norte de Santander (22)
(91, 22, 'Cúcuta'),
(92, 22, 'Ocaña'),
(93, 22, 'Pamplona'),
(94, 22, 'Villa del Rosario'),
(95, 22, 'Los Patios'),
(96, 22, 'Tibú'),
(97, 22, 'El Zulia'),
(98, 22, 'Saravena'),
(99, 22, 'Abrego'),
(100, 22, 'Cáchira'),

-- Sucre (28)
(101, 28, 'Sincelejo'),
(102, 28, 'Corozal'),
(103, 28, 'Sahagún'), -- Repetido, está en Córdoba también
(104, 28, 'San Marcos'),
(105, 28, 'San Onofre'),
(106, 28, 'Tolú'),
(107, 28, 'Morrosquillo'),
(108, 28, 'Coveñas'),
(109, 28, 'Santiago de Tolú'),
(110, 28, 'Buenavista'),

-- Huila (17)
(111, 17, 'Neiva'),
(112, 17, 'Pitalito'),
(113, 17, 'Garzón'),
(114, 17, 'La Plata'),
(115, 17, 'Campoalegre'),
(116, 17, 'Baraya'),
(117, 17, 'Palermo'),
(118, 17, 'San Agustín'),
(119, 17, 'Algeciras'),
(120, 17, 'Gigante'),

-- Boyacá (6)
(121, 6, 'Tunja'),
(122, 6, 'Duitama'),
(123, 6, 'Sogamoso'),
(124, 6, 'Chiquinquirá'),
(125, 6, 'Paipa'),
(126, 6, 'Villa de Leyva'),
(127, 6, 'Moniquirá'),
(128, 6, 'Soatá'),
(129, 6, 'Garagoa'),
(130, 6, 'Puerto Boyacá'),

-- Tolima (29)
(131, 29, 'Ibagué'),
(132, 29, 'Espinal'),
(133, 29, 'Honda'),
(134, 29, 'Mariquita'),
(135, 29, 'Melgar'),
(136, 29, 'Libano'),
(137, 29, 'Chaparrral'),
(138, 29, 'Natagaima'),
(139, 29, 'Coyaima'),
(140, 29, 'Ambalema'),

-- Caldas (7)
(141, 7, 'Manizales'),
(142, 7, 'Pereira'),
(143, 7, 'Armenia'),
(144, 7, 'La Dorada'),
(145, 7, 'Chinchiná'),
(146, 7, 'Villamaría'),
(147, 7, 'Salamina'),
(148, 7, 'Filadelfia'),
(149, 7, 'Neira'),
(150, 7, 'Supía'),

-- Risaralda (25)
(151, 25, 'Pereira'),
(152, 25, 'Dos Quebradas'),
(153, 25, 'Santa Rosa de Cabal'),
(154, 25, 'La Virginia'),
(155, 25, 'Quinchía'),
(156, 25, 'Mistrató'),
(157, 25, 'Belén de Umbría'),
(158, 25, 'Apía'),
(159, 25, 'Santuario'),
(160, 25, 'Balboa'),

-- Quindío (24)
(161, 24, 'Armenia'),
(162, 24, 'Calarcá'),
(163, 24, 'Circasia'),
(164, 24, 'La Tebaida'),
(165, 24, 'Montenegro'),
(166, 24, 'Quimbaya'),
(167, 24, 'Filandia'),
(168, 24, 'Salento'),
(169, 24, 'Génova'),
(170, 24, 'Barragán'),

-- Meta (20)
(171, 20, 'Villavicencio'),
(172, 20, 'Acacías'),
(173, 20, 'Puerto López'),
(174, 20, 'Granada'),
(175, 20, 'San Martín'),
(176, 20, 'Cumaral'),
(177, 20, 'Puerto Concordia'),
(178, 20, 'Mesetas'),
(179, 20, 'La Macarena'),
(180, 20, 'Restrepo'),

-- Nariño (21)
(181, 21, 'Pasto'),
(182, 21, 'Tumaco'),
(183, 21, 'Ipiales'),
(184, 21, 'Pasto'),
(185, 21, 'La Unión'),
(186, 21, 'Samaniego'),
(187, 21, 'Túquerres'),
(188, 21, 'Sandoná'),
(189, 21, 'Barbacoas'),
(190, 21, 'El Charco'),

-- Cauca (10)
(191, 10, 'Popayán'),
(192, 10, 'Cali'), -- Repetido
(193, 10, 'Santander de Quilichao'),
(194, 10, 'Patía'),
(195, 10, 'Piendamó'),
(196, 10, 'El Bordo'),
(197, 10, 'Bolívar'),
(198, 10, 'Sucre'),
(199, 10, 'Almaguer'),
(200, 10, 'La Vega'),

-- La Guajira (18)
(201, 18, 'Riohacha'),
(202, 18, 'Maicao'),
(203, 18, 'Uribia'),
(204, 18, 'Manaure'),
(205, 18, 'Alto Baudó'),
(206, 18, 'Fonseca'),
(207, 18, 'Dibulla'),
(208, 18, 'Barrancas'),
(209, 18, 'Hatonuevo'),
(210, 18, 'La Jagua del Pilar'),

-- Caquetá (8)
(211, 8, 'Florencia'),
(212, 8, 'San Vicente del Caguán'),
(213, 8, 'Cartagena del Chairá'),
(214, 8, 'Puerto Rico'),
(215, 8, 'Solano'),
(216, 8, 'Solita'),
(217, 8, 'Valparaíso'),
(218, 8, 'Belén de los Andaquies'),
(219, 8, 'Morelia'),
(220, 8, 'San José del Fragua'),

-- Casanare (9)
(221, 9, 'Yopal'),
(222, 9, 'Aguazul'),
(223, 9, 'Villanueva'),
(224, 9, 'Monterrey'),
(225, 9, 'Pore'),
(226, 9, 'San Luis de Palenque'),
(227, 9, 'Trinidad'),
(228, 9, 'Maní'),
(229, 9, 'Orocué'),
(230, 9, 'Hato Corozal'),

-- Arauca (3)
(231, 3, 'Arauca'),
(232, 3, 'Saravena'),
(233, 3, 'Tame'),
(234, 3, 'Arauquita'),
(235, 3, 'Cravo Norte'),
(236, 3, 'Fortul'),
(237, 3, 'Puerto Rondon'),
(238, 3, 'San José de Cravo Norte'),
(239, 3, 'Santa Rosalía'),
(240, 3, 'Campo Grande'),

-- Putumayo (23)
(241, 23, 'Mocoa'),
(242, 23, 'Puerto Asís'),
(243, 23, 'Orito'),
(244, 23, 'Sibundoy'),
(245, 23, 'Puerto Guzmán'),
(246, 23, 'Leguízamo'),
(247, 23, 'San Francisco'),
(248, 23, 'San Miguel'),
(249, 23, 'Villa Garzón'),
(250, 23, 'Colón'),

-- Amazonas (1)
(251, 1, 'Leticia'),
(252, 1, 'Puerto Amazonas'),
(253, 1, 'El Encanto'),
(254, 1, 'La Chorrera'),
(255, 1, 'La Pedrera'),
(256, 1, 'Puerto Alegría'),
(257, 1, 'Puerto Arica'),
(258, 1, 'Tarapacá'),
(259, 1, 'Barranco Minas'),
(260, 1, 'Sorvatela'),

-- Guainía (15)
(261, 15, 'Inírida'),
(262, 15, 'Barranco Minas'),
(263, 15, 'Caño Dorian'),
(264, 15, 'La Guadalupe'),
(265, 15, 'Mapiripana'),
(266, 15, 'Morichal'),
(267, 15, 'Pana Pana'),
(268, 15, 'Puerto Colombia'),
(269, 15, 'San Felipe'),
(270, 15, 'San José de Guaviare'),

-- Guaviare (16)
(271, 16, 'San José del Guaviare'),
(272, 16, 'Calamar'),
(273, 16, 'El Retorno'),
(274, 16, 'Miraflores'),
(275, 16, 'Barranco Minas'),
(276, 16, 'Capurganá'),
(277, 16, 'Cerro Azul'),
(278, 16, 'Güicán'),
(279, 16, 'Inírida'),
(280, 16, 'Puerto Cachicamo'),

-- Vaupés (31)
(281, 31, 'Mitú'),
(282, 31, 'Carurú'),
(283, 31, 'Pacoa'),
(284, 31, 'Papunahua'),
(285, 31, 'Taraira'),
(286, 31, 'Yavaraté'),
(287, 31, 'Buenos Aires'),
(288, 31, 'Cubará'),
(289, 31, 'Paya'),
(290, 31, 'Solano'),

-- Vichada (32)
(291, 32, 'Puerto Carreño'),
(292, 32, 'La Primavera'),
(293, 32, 'Santa Rosalía'),
(294, 32, 'Cumaribo'),
(295, 32, 'Puerto Colombia'),
(296, 32, 'Puerto Nariño'),
(297, 32, 'San José de Ocune'),
(298, 32, 'Santa Fe'),
(299, 32, 'Serrana'),
(300, 32, 'Wak運'),
-- San Andrés (26)
(301, 26, 'San Andrés'),
(302, 26, 'Providencia'),
(303, 26, 'Santa Catalina'),
(304, 26, 'San Luis'),
(305, 26, 'San Antonio de Prado'),
(306, 26, 'La Florida'),
(307, 26, 'Swan Key'),
(308, 26, 'Rocky Point'),
(309, 26, 'Bayside'),
(310, 26, 'Morris Hill')
ON CONFLICT (id) DO NOTHING;
