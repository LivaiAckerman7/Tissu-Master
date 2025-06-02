-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 05 juin 2024 à 18:04
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `boutiquedb`
--

DELIMITER $$
--
-- Procédures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `SellProduct` (IN `product_id` INT, IN `quantity` INT)   BEGIN
    UPDATE produit
    SET stock = stock - quantity
    WHERE id = product_id AND stock >= quantity;

    IF ROW_COUNT() = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Not enough stock or invalid product ID';
    END IF;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `boutique`
--

CREATE TABLE `boutique` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `adresse` varchar(255) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `proprio` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `boutique`
--

INSERT INTO `boutique` (`id`, `nom`, `adresse`, `telephone`, `email`, `proprio`) VALUES
(18, 'Boutique', 'Mariste', '33 547 85 95', 'momo@gmail.com', 'mohamedmoustaphaniang@esp.sn'),
(19, 'Test', 'test', '33 123 12 12', 'momomo@gmail.com', 'mohamedmoustaphaniang@esp.sn');

-- --------------------------------------------------------

--
-- Structure de la table `log_vente`
--

CREATE TABLE `log_vente` (
  `id` int(11) NOT NULL,
  `tissu_id` int(11) NOT NULL,
  `boutique_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `log_vente`
--

INSERT INTO `log_vente` (`id`, `tissu_id`, `boutique_id`, `quantity`, `price`, `date`) VALUES
(1, 38, 18, 1, 500.00, '2024-06-05 15:06:23'),
(2, 39, 19, 15, 16000.00, '2024-06-05 15:25:48'),
(3, 39, 19, 85, 150000.00, '2024-06-05 15:32:25');

-- --------------------------------------------------------

--
-- Structure de la table `tissu`
--

CREATE TABLE `tissu` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `stock` int(11) NOT NULL,
  `unite` enum('yard','mètre') NOT NULL,
  `boutique_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `tissu`
--

INSERT INTO `tissu` (`id`, `nom`, `stock`, `unite`, `boutique_id`) VALUES
(38, 'Soie', 130, 'yard', 18),
(39, 'Bazin', 100, 'mètre', 19),
(40, 'Soie', 85, 'mètre', 19);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `boutique`
--
ALTER TABLE `boutique`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_proprio` (`proprio`);

--
-- Index pour la table `log_vente`
--
ALTER TABLE `log_vente`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tissu_id` (`tissu_id`),
  ADD KEY `boutique_id` (`boutique_id`);

--
-- Index pour la table `tissu`
--
ALTER TABLE `tissu`
  ADD PRIMARY KEY (`id`),
  ADD KEY `boutique_id` (`boutique_id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `boutique`
--
ALTER TABLE `boutique`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT pour la table `log_vente`
--
ALTER TABLE `log_vente`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `tissu`
--
ALTER TABLE `tissu`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `log_vente`
--
ALTER TABLE `log_vente`
  ADD CONSTRAINT `log_vente_ibfk_1` FOREIGN KEY (`tissu_id`) REFERENCES `tissu` (`id`),
  ADD CONSTRAINT `log_vente_ibfk_2` FOREIGN KEY (`boutique_id`) REFERENCES `boutique` (`id`);

--
-- Contraintes pour la table `tissu`
--
ALTER TABLE `tissu`
  ADD CONSTRAINT `tissu_ibfk_1` FOREIGN KEY (`boutique_id`) REFERENCES `boutique` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
