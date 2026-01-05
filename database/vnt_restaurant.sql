-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th1 05, 2026 lúc 06:51 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `vnt_restaurant`
--

DELIMITER $$
--
-- Thủ tục
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `import_stock` (IN `p_ingredient_id` BIGINT, IN `p_quantity` DECIMAL(12,2), IN `p_price` DECIMAL(12,2), IN `p_import_id` BIGINT, IN `p_staff_id` BIGINT)   BEGIN
    INSERT INTO inventory_log
    (ingredient_id, type, quantity, price, ref_type, ref_id, staff_id)
    VALUES
    (p_ingredient_id, 'import', p_quantity, p_price, 'import', p_import_id, p_staff_id);

    UPDATE ingredient
    SET quantity = quantity + p_quantity,
        price = p_price
    WHERE id = p_ingredient_id;
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `use_stock` (IN `p_ingredient_id` BIGINT, IN `p_quantity` DECIMAL(12,2), IN `p_invoice_id` BIGINT, IN `p_staff_id` BIGINT)   BEGIN
    DECLARE current_qty DECIMAL(12,2);
    DECLARE ingredient_name VARCHAR(255);
    DECLARE err_msg VARCHAR(255);

    -- Lấy tồn kho hiện tại
    SELECT IFNULL(SUM(
            CASE 
                WHEN type = 'import' THEN quantity
                WHEN type = 'export' THEN -quantity
            END
        ), 0)
    INTO current_qty
    FROM inventory_log
    WHERE ingredient_id = p_ingredient_id;

    -- Lấy tên nguyên liệu
    SELECT name INTO ingredient_name 
    FROM ingredient 
    WHERE id = p_ingredient_id;

    IF current_qty < p_quantity THEN
    SET err_msg = CONCAT(ingredient_name, ' không đủ tồn kho, hiện còn ', current_qty);
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = err_msg;
END IF;

    -- Ghi xuất kho
    INSERT INTO inventory_log
        (ingredient_id, type, quantity, ref_type, ref_id, staff_id)
    VALUES
        (p_ingredient_id, 'export', p_quantity, 'invoice', p_invoice_id, p_staff_id);

    UPDATE ingredient
    SET quantity = quantity - p_quantity
    WHERE id = p_ingredient_id;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `activity_log`
--

CREATE TABLE `activity_log` (
  `id` bigint(20) NOT NULL,
  `staff_id` bigint(20) DEFAULT NULL,
  `action` varchar(50) DEFAULT NULL,
  `subject_type` varchar(50) DEFAULT NULL,
  `subject_id` bigint(20) DEFAULT NULL,
  `amount` decimal(15,2) DEFAULT 0.00,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `activity_log`
--

INSERT INTO `activity_log` (`id`, `staff_id`, `action`, `subject_type`, `subject_id`, `amount`, `description`, `created_at`) VALUES
(5, 1, 'checkout', 'invoice', 96, 528000.00, ' vừa bán hóa đơn #96 với giá trị 528,000đ', '2026-01-06 00:09:03'),
(6, 1, 'import', 'import', 29, 230000.00, ' nhập hàng (1 nguyên liệu: Thịt Bò) trị giá 230,000đ', '2026-01-06 00:11:19'),
(7, 1, 'import', 'import', 30, 130000.00, ' nhập hàng (1 nguyên liệu: Măng Trúc) trị giá 130,000đ', '2026-01-06 00:13:59'),
(8, 1, 'import', 'import', 31, 35000.00, ' nhập hàng (1 nguyên liệu: Đậu Phụ) trị giá 35,000đ', '2026-01-06 00:17:57');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `area`
--

CREATE TABLE `area` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `area`
--

INSERT INTO `area` (`id`, `name`) VALUES
(1, 'Mang Về'),
(2, 'Ngoài Trời'),
(3, 'Tầng 1'),
(4, 'Tầng 2'),
(5, 'App');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking`
--

CREATE TABLE `booking` (
  `id` bigint(20) NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `location_id` bigint(20) NOT NULL DEFAULT 1,
  `customer_id` bigint(20) DEFAULT NULL,
  `customer_name` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `booking_time` datetime NOT NULL,
  `guest_count` int(11) NOT NULL DEFAULT 1,
  `status` enum('waiting','assigned','received','cancel') NOT NULL DEFAULT 'waiting',
  `area_id` bigint(20) DEFAULT NULL,
  `table_id` bigint(20) DEFAULT NULL,
  `promotion_id` bigint(20) DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `booking`
--

INSERT INTO `booking` (`id`, `code`, `location_id`, `customer_id`, `customer_name`, `phone`, `booking_time`, `guest_count`, `status`, `area_id`, `table_id`, `promotion_id`, `note`, `created_by`, `created_at`) VALUES
(1, 'DB000001', 1, 3, 'a Kỳ', '0985237963', '2025-12-25 02:07:00', 15, 'received', NULL, 3, NULL, NULL, 1, '2025-12-24 17:07:10'),
(2, 'DB000002', 1, 4, 'c Hà', '0965968725', '2025-12-25 02:34:00', 7, 'received', NULL, 19, NULL, NULL, 1, '2025-12-24 17:34:52'),
(3, 'DB000003', 1, 5, 'c Hiền', '0945262288', '2025-12-26 18:30:00', 6, 'cancel', NULL, NULL, NULL, NULL, 1, '2025-12-24 17:38:12'),
(4, 'DB000004', 1, 6, 'a Tuân', '0915250990', '2025-12-26 18:30:00', 15, 'cancel', NULL, 26, NULL, NULL, 1, '2025-12-25 06:48:21'),
(5, 'DB000005', 1, 7, 'c Hà', '0359579475', '2025-12-26 17:15:00', 5, 'received', NULL, 26, NULL, NULL, 1, '2025-12-25 07:15:19'),
(7, 'DB000006', 1, 9, 'C Phương Anh', '0969384382', '2025-12-26 17:24:00', 10, 'received', NULL, 14, NULL, NULL, 1, '2025-12-25 07:26:01'),
(8, 'DB000007', 1, 10, 'a Thành', '0961581328', '2025-12-25 16:35:00', 1, 'received', NULL, 19, NULL, NULL, 1, '2025-12-25 09:35:59'),
(9, 'DB000008', 1, NULL, 'a', '0917771117', '2025-12-26 11:00:00', 3, 'received', NULL, 2, NULL, NULL, NULL, '2025-12-25 17:54:39'),
(10, 'DB000009', 1, 11, 'Thái Hoàng Vĩnh', '0776460161', '2025-12-26 17:00:00', 5, 'assigned', NULL, 21, NULL, NULL, NULL, '2025-12-25 18:11:33'),
(11, 'DB000010', 1, 10, 'a', '0961581328', '2025-12-26 10:00:00', 2, 'cancel', NULL, NULL, NULL, NULL, NULL, '2025-12-26 10:38:07'),
(12, 'DB000011', 1, 12, 'Nguyễn Hiên', '0334997011', '2025-12-30 17:30:00', 4, 'assigned', NULL, 18, NULL, NULL, NULL, '2025-12-26 10:39:44'),
(13, 'DB000012', 1, 13, 'Dương Hà', '0982536243', '2025-12-31 21:00:00', 5, 'assigned', NULL, 23, 1, NULL, NULL, '2025-12-30 14:58:43'),
(14, 'DB000013', 1, 15, 'a', '0123456789', '2025-12-31 18:22:00', 1, 'cancel', NULL, 26, NULL, NULL, 1, '2025-12-31 11:22:52'),
(15, 'DB000014', 1, 16, 'a', '0961581321', '2026-01-01 22:43:00', 10, 'waiting', NULL, NULL, NULL, NULL, 1, '2025-12-31 13:43:46'),
(16, 'DB000015', 1, 10, 'a Thành', '0961581328', '2026-01-01 20:56:00', 1, 'cancel', NULL, NULL, NULL, NULL, 1, '2025-12-31 13:56:35'),
(17, 'DB000016', 1, 10, 'a Thành', '0961581328', '2026-01-01 20:56:00', 1, 'cancel', NULL, NULL, NULL, NULL, 1, '2025-12-31 13:56:57'),
(18, 'DB000017', 1, 10, 'a Thành', '0961581328', '2026-01-01 20:58:00', 1, 'cancel', NULL, NULL, NULL, NULL, 1, '2025-12-31 13:58:56');

--
-- Bẫy `booking`
--
DELIMITER $$
CREATE TRIGGER `booking_before_insert` BEFORE INSERT ON `booking` FOR EACH ROW BEGIN
    DECLARE new_id BIGINT;

    SELECT last_id + 1
    INTO new_id
    FROM id_counters
    WHERE table_name = 'booking'
    FOR UPDATE;

    SET NEW.code = CONCAT('DB', LPAD(new_id, 6, '0'));

    UPDATE id_counters
    SET last_id = new_id
    WHERE table_name = 'booking';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_item`
--

CREATE TABLE `booking_item` (
  `id` bigint(20) NOT NULL,
  `booking_id` bigint(20) NOT NULL,
  `product_id` bigint(20) NOT NULL,
  `product_name` varchar(150) NOT NULL,
  `qty` decimal(10,2) NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `note` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `booking_item`
--

INSERT INTO `booking_item` (`id`, `booking_id`, `product_id`, `product_name`, `qty`, `price`, `note`) VALUES
(33, 7, 1, 'Lẩu Thái Tomyum', 1.00, 400000.00, ''),
(34, 7, 2, 'Lẩu Riêu Cua', 1.00, 350000.00, ''),
(35, 7, 3, 'Lẩu Ốc Nhồi', 1.00, 350000.00, ''),
(36, 7, 4, 'Lẩu Ếch', 1.00, 250000.00, ''),
(37, 11, 5, 'Lẩu Bò Nhúng Dấm', 1.00, 300000.00, NULL),
(38, 11, 4, 'Lẩu Ếch', 1.00, 250000.00, NULL),
(43, 2, 1, 'Lẩu Thái Tomyum', 1.00, 400000.00, ''),
(44, 12, 3, 'Lẩu Ốc Nhồi', 1.00, 350000.00, ''),
(45, 12, 4, 'Lẩu Ếch', 1.00, 250000.00, ''),
(46, 12, 5, 'Lẩu Bò Nhúng Dấm', 1.00, 300000.00, '');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `category_ingredient`
--

CREATE TABLE `category_ingredient` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `category_ingredient`
--

INSERT INTO `category_ingredient` (`id`, `name`) VALUES
(1, 'Nguyên Liệu Tươi'),
(2, 'Nguyên Liệu Rau'),
(3, 'Đồ Khô');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `category_product`
--

CREATE TABLE `category_product` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `category_product`
--

INSERT INTO `category_product` (`id`, `name`) VALUES
(1, 'Lẩu'),
(2, 'Hải Sản'),
(3, 'Chân Gà'),
(4, 'Cánh Gà'),
(5, 'Đồ Ăn Vặt'),
(6, 'Đồ Nhậu'),
(7, 'Salad'),
(8, 'Rau'),
(9, 'Cháo'),
(10, 'Cơm Rang'),
(11, 'Mì Xào'),
(12, 'Miến Xào'),
(13, 'Đồ Uống'),
(14, 'Hoa Quả');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `contact`
--

CREATE TABLE `contact` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `type` enum('complaint','media') NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `subject` varchar(150) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `status` enum('pending','processed') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `contact`
--

INSERT INTO `contact` (`id`, `code`, `type`, `name`, `phone`, `email`, `subject`, `message`, `status`, `created_at`) VALUES
(1, 'LH000001', 'complaint', 'Nhật Thành', '0989123333', 'npnthanh.03@gmail.com', 'Phản ánh về nhân viên', 'Lần đầu trải nghiệm. Đồ ăn tươi ngon, nhân viên phục vụ tốt', 'processed', '2025-12-29 14:24:03'),
(2, 'LH000002', 'media', 'Hoàng Thảo Linh', '0385134712', 'forworkthaolinh@gmail.com', 'Hợp tác Review', 'Em xin phép chào nhà hàng \r\nEm là chủ kênh : Em Linh Diệu Mận\r\nChuyên về review ẩm thực/ đồ uống hà nội và quảng bá những món ngon đến mọi người\r\nEm cảm thấy các món rất là phù hợp và muốn được hợp tác cùng nhà hàng để review món ăn bên mình trên nền tảng tiktok ạ', 'processed', '2025-12-29 14:26:52');

--
-- Bẫy `contact`
--
DELIMITER $$
CREATE TRIGGER `contact_before_insert` BEFORE INSERT ON `contact` FOR EACH ROW BEGIN
    DECLARE new_id BIGINT;

    SELECT last_id + 1
    INTO new_id
    FROM id_counters
    WHERE table_name = 'contact'
    FOR UPDATE;

    SET NEW.code = CONCAT('LH', LPAD(new_id, 6, '0'));

    UPDATE id_counters
    SET last_id = new_id
    WHERE table_name = 'contact';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `customer`
--

CREATE TABLE `customer` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(150) DEFAULT NULL,
  `gender` enum('nam','nữ','khác') DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `customer`
--

INSERT INTO `customer` (`id`, `code`, `name`, `phone`, `email`, `gender`, `dob`, `created_at`, `updated_at`) VALUES
(1, 'KH000001', 'a Chung', '0936470093', NULL, 'nam', NULL, '2025-12-23 10:08:37', '2025-12-23 14:40:42'),
(2, 'KH000002', 'a Hiếu', '0982460399', NULL, 'nam', NULL, '2025-12-23 10:14:56', '2025-12-23 14:41:20'),
(3, 'KH000003', 'a Kỳ', '0985237963', NULL, 'nam', NULL, '2025-12-23 10:17:55', '2025-12-24 08:20:58'),
(4, 'KH000004', 'c Hà', '0965968725', NULL, NULL, NULL, '2025-12-24 17:34:52', '2025-12-24 17:34:52'),
(5, 'KH000005', 'c Hiền', '0945262288', NULL, NULL, NULL, '2025-12-24 17:38:12', '2025-12-24 17:38:32'),
(6, 'KH000006', 'a Tuân', '0915250990', NULL, NULL, NULL, '2025-12-25 06:48:21', '2025-12-25 06:48:21'),
(7, 'KH000007', 'c Hà', '0359579475', NULL, NULL, NULL, '2025-12-25 07:15:19', '2025-12-25 07:15:19'),
(9, 'KH000008', 'c Phương Anh', '0969384382', NULL, NULL, NULL, '2025-12-25 07:26:01', '2025-12-30 14:03:56'),
(10, 'KH000009', 'a Thành', '0961581328', NULL, NULL, NULL, '2025-12-25 09:35:59', '2025-12-25 17:55:47'),
(11, 'KH000010', 'Thái Hoàng Vĩnh', '0776460161', NULL, NULL, NULL, '2025-12-25 18:11:33', '2025-12-25 18:11:33'),
(12, 'KH000011', 'Nguyễn Hiên', '0334997011', NULL, NULL, NULL, '2025-12-26 10:39:44', '2025-12-26 10:39:44'),
(13, 'KH000012', 'Dương Hà', '0982536243', NULL, NULL, NULL, '2025-12-30 14:58:43', '2025-12-30 14:58:43'),
(14, 'KH000013', 'C Huyền', '0976582140', NULL, NULL, NULL, '2025-12-31 09:23:16', '2026-01-01 13:51:30'),
(15, 'KH000014', 'a Thắng', '0915352111', NULL, NULL, NULL, '2025-12-31 11:22:52', '2026-01-01 13:51:46'),
(16, 'KH000015', 'a Nam', '0961581321', NULL, NULL, NULL, '2025-12-31 13:43:46', '2026-01-01 13:52:04');

--
-- Bẫy `customer`
--
DELIMITER $$
CREATE TRIGGER `customer_before_insert` BEFORE INSERT ON `customer` FOR EACH ROW BEGIN
    DECLARE new_id BIGINT;

    SELECT last_id + 1
    INTO new_id
    FROM id_counters
    WHERE table_name = 'customer'
    FOR UPDATE;

    SET NEW.code = CONCAT('KH', LPAD(new_id, 6, '0'));

    UPDATE id_counters
    SET last_id = new_id
    WHERE table_name = 'customer';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `dining_table`
--

CREATE TABLE `dining_table` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `area_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `dining_table`
--

INSERT INTO `dining_table` (`id`, `name`, `area_id`, `status`) VALUES
(1, 'Mang Về', 1, 'active'),
(2, 'Bàn 1', 3, 'active'),
(3, 'Bàn 2', 3, 'active'),
(4, 'Bàn 3', 3, 'active'),
(5, 'Bàn 4', 3, 'active'),
(6, 'Bàn 5', 3, 'active'),
(7, 'Bàn 6', 3, 'active'),
(8, 'Bàn 7', 3, 'active'),
(9, 'Bàn 8', 3, 'active'),
(10, 'Bàn 9', 3, 'active'),
(11, 'Bàn 10', 3, 'active'),
(12, 'Bàn 11', 3, 'active'),
(13, 'Bàn 12', 3, 'active'),
(14, 'Bàn 13', 3, 'active'),
(15, 'Bàn 14', 3, 'active'),
(16, 'Bàn 15', 3, 'active'),
(17, 'Bàn 16', 3, 'active'),
(18, 'Bàn 17', 3, 'active'),
(19, 'Bàn 18', 3, 'active'),
(20, 'Bàn 19', 3, 'active'),
(21, 'Bàn 20', 3, 'active'),
(22, 'Bàn 21', 2, 'active'),
(23, 'Bàn 22', 2, 'active'),
(24, 'Bàn 23', 2, 'active'),
(25, 'Bàn 24', 2, 'active'),
(26, 'bàn 25', 2, 'active'),
(27, 'Bàn 26', 2, 'active'),
(28, 'Bàn 27', 2, 'active'),
(29, 'Bàn 28', 2, 'active'),
(30, 'Bàn 29', 2, 'active'),
(31, 'Bàn 30', 2, 'active'),
(32, 'Bàn 31', 2, 'active'),
(33, 'Bàn 32', 2, 'active'),
(34, 'Bàn 33', 2, 'active'),
(35, 'Bàn 34', 2, 'active'),
(36, 'Bàn 35', 2, 'active'),
(37, 'Bàn To 1', 4, 'active'),
(38, 'Bàn To 2', 4, 'active'),
(39, 'Bàn To 3', 4, 'active'),
(40, 'Bàn To 4', 4, 'active'),
(41, 'Bàn To 5', 4, 'active'),
(42, 'Bàn To 6', 4, 'active'),
(43, 'Bàn To 7', 4, 'active'),
(44, 'Bàn To 8', 4, 'active'),
(45, 'Bàn To 9', 4, 'active'),
(46, 'Bàn To 10', 4, 'active'),
(47, 'Shoppe', 5, 'active'),
(48, 'Grab', 5, 'active'),
(49, 'Be', 5, 'active'),
(50, 'Xanh SM', 5, 'active');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `export`
--

CREATE TABLE `export` (
  `id` bigint(20) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `staff_id` bigint(20) DEFAULT NULL,
  `export_time` datetime DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `status` enum('completed','cancelled') DEFAULT 'completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `export`
--

INSERT INTO `export` (`id`, `code`, `staff_id`, `export_time`, `reason`, `status`, `created_at`) VALUES
(5, 'XH000001', 1, '2025-12-23 00:34:00', 'Xuất kho', 'completed', '2025-12-22 17:38:18'),
(6, 'XH000002', 1, '2025-12-23 00:41:00', 'Xuất kho', 'completed', '2025-12-22 17:41:39'),
(7, 'XH000004', 1, '2026-01-05 23:59:00', 'Xuất kho', 'completed', '2026-01-05 16:59:42');

--
-- Bẫy `export`
--
DELIMITER $$
CREATE TRIGGER `export_before_insert` BEFORE INSERT ON `export` FOR EACH ROW BEGIN
    DECLARE new_id BIGINT;

    SELECT last_id + 1
    INTO new_id
    FROM id_counters
    WHERE table_name = 'export'
    FOR UPDATE;

    SET NEW.code = CONCAT('XH', LPAD(new_id, 6, '0'));

    UPDATE id_counters
    SET last_id = new_id
    WHERE table_name = 'export';
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_export_code` BEFORE INSERT ON `export` FOR EACH ROW BEGIN
    DECLARE new_id BIGINT;

    SELECT last_id + 1
    INTO new_id
    FROM id_counters
    WHERE table_name = 'export'
    FOR UPDATE;

    SET NEW.code = CONCAT('XH', LPAD(new_id, 6, '0'));

    UPDATE id_counters
    SET last_id = new_id
    WHERE table_name = 'export';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `export_details`
--

CREATE TABLE `export_details` (
  `id` bigint(20) NOT NULL,
  `export_id` bigint(20) DEFAULT NULL,
  `ingredient_id` bigint(20) DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `export_details`
--

INSERT INTO `export_details` (`id`, `export_id`, `ingredient_id`, `quantity`, `price`, `created_at`) VALUES
(1, 5, 1, 1.00, 255000.00, '2025-12-22 17:38:18'),
(2, 6, 2, 1.00, 75000.00, '2025-12-22 17:41:39'),
(3, 7, 17, 2.00, 100000.00, '2026-01-05 16:59:42');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `id_counters`
--

CREATE TABLE `id_counters` (
  `table_name` varchar(50) NOT NULL,
  `last_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `id_counters`
--

INSERT INTO `id_counters` (`table_name`, `last_id`) VALUES
('booking', 17),
('contact', 2),
('customer', 15),
('export', 4),
('import', 24),
('ingredient', 20),
('invoice', 54),
('product', 67),
('promotion', 2),
('users', 34);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `import`
--

CREATE TABLE `import` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(20) NOT NULL,
  `staff_id` bigint(20) UNSIGNED NOT NULL,
  `import_time` datetime DEFAULT NULL,
  `total_price` decimal(12,2) DEFAULT 0.00,
  `status` enum('completed','cancelled') NOT NULL DEFAULT 'completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `import`
--

INSERT INTO `import` (`id`, `code`, `staff_id`, `import_time`, `total_price`, `status`, `created_at`, `updated_at`) VALUES
(6, 'PN000001', 1, '2025-12-14 00:41:00', 300000.00, 'cancelled', '2025-12-13 17:41:15', '2025-12-13 18:01:43'),
(7, 'PN000002', 1, '2025-12-14 00:45:00', 300000.00, 'completed', '2025-12-13 17:45:16', '2025-12-13 17:45:16'),
(8, 'PN000003', 1, '2025-12-14 00:45:00', 300000.00, 'completed', '2025-12-13 17:45:52', '2025-12-13 17:45:52'),
(9, 'PN000004', 1, '2025-12-14 00:49:00', 300000.00, 'completed', '2025-12-13 17:49:11', '2025-12-13 17:49:11'),
(10, 'PN000005', 1, '2025-12-15 14:56:00', 100000.00, 'completed', '2025-12-15 07:56:16', '2025-12-15 07:56:16'),
(11, 'PN000006', 1, '2025-12-21 00:57:00', 1425000.00, 'completed', '2025-12-20 17:57:25', '2025-12-20 17:57:25'),
(12, 'PN000007', 1, '2025-12-21 01:46:00', 220000.00, 'completed', '2025-12-20 18:46:56', '2025-12-20 18:46:56'),
(13, 'PN000008', 1, '2025-12-21 01:52:00', 220000.00, 'completed', '2025-12-20 18:52:55', '2025-12-20 18:52:55'),
(14, 'PN000009', 1, '2025-12-21 01:55:00', 200000.00, 'completed', '2025-12-20 18:55:24', '2025-12-20 18:55:24'),
(15, 'PN000010', 1, '2025-12-21 02:01:00', 200000.00, 'completed', '2025-12-20 19:01:44', '2025-12-20 19:01:44'),
(18, 'PN000011', 1, '2025-12-21 16:25:00', 0.00, 'cancelled', '2025-12-21 09:28:40', '2025-12-21 09:28:45'),
(19, 'PN000012', 1, '2025-12-21 16:28:00', 4815000.00, 'completed', '2025-12-21 09:29:35', '2025-12-21 09:29:35'),
(20, 'PN000013', 1, '2025-12-23 00:40:00', 930000.00, 'completed', '2025-12-22 17:40:56', '2025-12-22 17:40:56'),
(21, 'PN000014', 1, '2025-12-31 16:22:00', 135540.00, 'completed', '2025-12-31 09:22:55', '2025-12-31 09:22:55'),
(22, 'PN000015', 1, '2026-01-01 20:49:00', 100000.00, 'completed', '2026-01-01 13:49:53', '2026-01-01 13:49:53'),
(23, 'PN000016', 1, '2026-01-05 13:41:00', 14000.00, 'completed', '2026-01-05 06:41:13', '2026-01-05 06:41:13'),
(24, 'PN000017', 1, '2026-01-05 13:41:00', 14000.00, 'completed', '2026-01-05 06:41:34', '2026-01-05 06:41:34'),
(25, 'PN000018', 1, '2026-01-05 13:42:00', 168000.00, 'completed', '2026-01-05 06:43:02', '2026-01-05 06:43:02'),
(26, 'PN000019', 1, '2026-01-05 13:42:00', 120000.00, 'completed', '2026-01-05 06:43:21', '2026-01-05 06:43:21'),
(27, 'PN000020', 1, '2026-01-05 23:38:00', 1000000.00, 'completed', '2026-01-05 16:38:25', '2026-01-05 16:38:25'),
(28, 'PN000021', 1, '2026-01-05 23:57:00', 250000.00, 'completed', '2026-01-05 16:57:43', '2026-01-05 16:57:43'),
(29, 'PN000022', 1, '2026-01-06 00:11:00', 230000.00, 'completed', '2026-01-05 17:11:19', '2026-01-05 17:11:19'),
(30, 'PN000023', 1, '2026-01-06 00:13:00', 130000.00, 'completed', '2026-01-05 17:13:59', '2026-01-05 17:13:59'),
(31, 'PN000024', 1, '2026-01-06 00:17:00', 35000.00, 'completed', '2026-01-05 17:17:57', '2026-01-05 17:17:57');

--
-- Bẫy `import`
--
DELIMITER $$
CREATE TRIGGER `trg_import_code` BEFORE INSERT ON `import` FOR EACH ROW BEGIN
    DECLARE new_id BIGINT;

    SELECT last_id + 1
    INTO new_id
    FROM id_counters
    WHERE table_name = 'import'
    FOR UPDATE;

    SET NEW.code = CONCAT('PN', LPAD(new_id, 6, '0'));

    UPDATE id_counters
    SET last_id = new_id
    WHERE table_name = 'import';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `import_details`
--

CREATE TABLE `import_details` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `import_id` bigint(20) UNSIGNED NOT NULL,
  `ingredient_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(12,2) NOT NULL DEFAULT 0.00,
  `price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `amount` decimal(12,2) GENERATED ALWAYS AS (`quantity` * `price`) STORED,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `import_details`
--

INSERT INTO `import_details` (`id`, `import_id`, `ingredient_id`, `quantity`, `price`, `created_at`, `updated_at`) VALUES
(6, 6, 4, 1.00, 300000.00, '2025-12-13 17:41:15', '2025-12-13 17:41:15'),
(7, 7, 4, 1.00, 300000.00, '2025-12-13 17:45:16', '2025-12-13 17:45:16'),
(8, 8, 4, 1.00, 300000.00, '2025-12-13 17:45:52', '2025-12-13 17:45:52'),
(9, 9, 4, 1.00, 300000.00, '2025-12-13 17:49:11', '2025-12-13 17:49:11'),
(10, 10, 17, 1.00, 100000.00, '2025-12-15 07:56:16', '2025-12-15 07:56:16'),
(11, 11, 6, 5.00, 285000.00, '2025-12-20 17:57:25', '2025-12-20 17:57:25'),
(12, 12, 10, 100.00, 2200.00, '2025-12-20 18:46:56', '2025-12-20 18:46:56'),
(13, 13, 10, 100.00, 2200.00, '2025-12-20 18:52:55', '2025-12-20 18:52:55'),
(14, 14, 10, 100.00, 2000.00, '2025-12-20 18:55:24', '2025-12-20 18:55:24'),
(15, 15, 10, 100.00, 2000.00, '2025-12-20 19:01:44', '2025-12-20 19:01:44'),
(18, 18, 12, 1.00, 0.00, '2025-12-21 09:28:40', '2025-12-21 09:28:40'),
(19, 19, 1, 5.00, 235000.00, '2025-12-21 09:29:35', '2025-12-21 09:29:35'),
(20, 19, 4, 3.00, 330000.00, '2025-12-21 09:29:35', '2025-12-21 09:29:35'),
(21, 19, 5, 5.00, 215000.00, '2025-12-21 09:29:35', '2025-12-21 09:29:35'),
(22, 19, 6, 5.00, 315000.00, '2025-12-21 09:29:35', '2025-12-21 09:29:35'),
(23, 20, 2, 5.00, 75000.00, '2025-12-22 17:40:56', '2025-12-22 17:40:56'),
(24, 20, 3, 5.00, 75000.00, '2025-12-22 17:40:56', '2025-12-22 17:40:56'),
(25, 20, 7, 3.00, 60000.00, '2025-12-22 17:40:56', '2025-12-22 17:40:56'),
(26, 21, 8, 20.70, 2200.00, '2025-12-31 09:22:55', '2025-12-31 09:22:55'),
(27, 21, 9, 100.00, 900.00, '2025-12-31 09:22:55', '2025-12-31 09:22:55'),
(28, 22, 11, 10.00, 10000.00, '2026-01-01 13:49:53', '2026-01-01 13:49:53'),
(29, 23, 16, 2.00, 7000.00, '2026-01-05 06:41:13', '2026-01-05 06:41:13'),
(30, 24, 16, 2.00, 7000.00, '2026-01-05 06:41:34', '2026-01-05 06:41:34'),
(31, 25, 18, 24.00, 7000.00, '2026-01-05 06:43:02', '2026-01-05 06:43:02'),
(32, 26, 19, 24.00, 5000.00, '2026-01-05 06:43:21', '2026-01-05 06:43:21'),
(33, 27, 17, 10.00, 100000.00, '2026-01-05 16:38:25', '2026-01-05 16:38:25'),
(34, 28, 15, 1.00, 250000.00, '2026-01-05 16:57:43', '2026-01-05 16:57:43'),
(35, 29, 14, 1.00, 230000.00, '2026-01-05 17:11:19', '2026-01-05 17:11:19'),
(36, 30, 13, 10.00, 13000.00, '2026-01-05 17:13:59', '2026-01-05 17:13:59'),
(37, 31, 12, 10.00, 3500.00, '2026-01-05 17:17:57', '2026-01-05 17:17:57');

--
-- Bẫy `import_details`
--
DELIMITER $$
CREATE TRIGGER `after_import_detail_delete_total` AFTER DELETE ON `import_details` FOR EACH ROW BEGIN
    UPDATE `import` i
    SET i.total_price = (
        SELECT IFNULL(SUM(quantity * price),0)
        FROM `import_details`
        WHERE import_id = OLD.import_id
    )
    WHERE i.id = OLD.import_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_import_detail_insert_total` AFTER INSERT ON `import_details` FOR EACH ROW BEGIN
    UPDATE `import` i
    SET i.total_price = (
        SELECT IFNULL(SUM(quantity * price),0)
        FROM `import_details`
        WHERE import_id = NEW.import_id
    )
    WHERE i.id = NEW.import_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_import_detail_update_total` AFTER UPDATE ON `import_details` FOR EACH ROW BEGIN
    UPDATE `import` i
    SET i.total_price = (
        SELECT IFNULL(SUM(quantity * price),0)
        FROM `import_details`
        WHERE import_id = NEW.import_id
    )
    WHERE i.id = NEW.import_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `ingredient`
--

CREATE TABLE `ingredient` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `quantity` decimal(12,2) DEFAULT 0.00,
  `unit` varchar(50) DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL COMMENT 'Giá 1 đơn vị',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `ingredient`
--

INSERT INTO `ingredient` (`id`, `code`, `category_id`, `name`, `quantity`, `unit`, `price`, `created_at`) VALUES
(1, 'NL000001', 1, 'Mực', 4.00, 'kg', 235000.00, '2025-11-25 19:30:18'),
(2, 'NL000002', 1, 'Cánh Gà', 3.20, 'kg', 75000.00, '2025-12-01 06:25:26'),
(3, 'NL000003', 1, 'Chân Gà', 5.00, 'kg', 75000.00, '2025-12-01 06:25:26'),
(4, 'NL000004', 1, 'Tôm Sú', 2.60, 'kg', 330000.00, '2025-12-09 18:02:33'),
(5, 'NL000005', 1, 'Bạch Tuộc', 5.00, 'kg', 215000.00, '2025-12-09 18:10:45'),
(6, 'NL000006', 1, 'Ốc Hương', 4.40, 'kg', 315000.00, '2025-12-10 07:46:19'),
(7, 'NL000007', 1, 'Chân Gà Rút Xương', 2.20, 'kg', 60000.00, '2025-12-10 09:51:43'),
(8, 'NL000008', 1, 'Bánh Mì', 14.70, 'Cái', 2200.00, '2025-12-10 10:02:40'),
(9, 'NL000009', 1, 'Trứng Cút Lộn', 100.00, 'Quả', 900.00, '2025-12-10 10:14:03'),
(10, 'NL000010', 1, 'Nem Chua', 90.00, 'Cái', 2000.00, '2025-12-10 10:16:44'),
(11, 'NL000011', 3, 'Ngô Hộp', 9.00, 'Hộp', 10000.00, '2025-12-10 10:18:18'),
(12, 'NL000012', 1, 'Đậu Phụ', 10.00, 'Bìa', 3500.00, '2025-12-10 13:26:36'),
(13, 'NL000013', 2, 'Măng Trúc', 10.00, 'Gói', 13000.00, '2025-12-10 13:33:19'),
(14, 'NL000014', 1, 'Thịt Bò', 1.00, 'kg', 230000.00, '2025-12-10 13:34:28'),
(15, 'NL000015', 1, 'Thịt Trâu', 1.00, 'kg', 250000.00, '2025-12-10 13:38:02'),
(16, 'NL000016', 2, 'Rau Muống', 3.50, 'mớ', 7000.00, '2025-12-10 13:38:26'),
(17, 'NL000017', 1, 'Ếch', 8.00, 'kg', 100000.00, '2025-12-10 13:40:50'),
(18, 'NL000018', 3, 'Nước Cam', 23.00, 'Lon', 7000.00, '2025-12-10 15:20:44'),
(19, 'NL000019', 3, 'Nước Lọc', 23.00, 'Chai', 5000.00, '2025-12-10 15:21:49');

--
-- Bẫy `ingredient`
--
DELIMITER $$
CREATE TRIGGER `ingredient_before_insert` BEFORE INSERT ON `ingredient` FOR EACH ROW BEGIN
    DECLARE new_id BIGINT;
    SELECT last_id + 1 INTO new_id FROM id_counters WHERE table_name='ingredient';
    SET NEW.code = CONCAT('NL', LPAD(new_id,6,'0'));
    UPDATE id_counters SET last_id=new_id WHERE table_name='ingredient';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `ingredient_available_stock`
-- (See below for the actual view)
--
CREATE TABLE `ingredient_available_stock` (
`ingredient_id` bigint(20) unsigned
,`code` varchar(10)
,`name` varchar(150)
,`unit` varchar(50)
,`available_qty` decimal(35,2)
,`last_price` decimal(12,2)
);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `inventory_log`
--

CREATE TABLE `inventory_log` (
  `id` bigint(20) NOT NULL,
  `ingredient_id` bigint(20) NOT NULL,
  `type` enum('import','export') NOT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `price` decimal(12,2) DEFAULT 0.00,
  `ref_type` varchar(50) DEFAULT NULL,
  `ref_id` bigint(20) DEFAULT NULL,
  `staff_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `inventory_log`
--

INSERT INTO `inventory_log` (`id`, `ingredient_id`, `type`, `quantity`, `price`, `ref_type`, `ref_id`, `staff_id`, `created_at`) VALUES
(1, 10, 'import', 100.00, 2200.00, 'import', 13, 1, '2025-12-20 18:52:55'),
(2, 10, 'export', 10.00, 0.00, 'invoice', 26, 1, '2025-12-20 18:53:34'),
(3, 10, 'import', 100.00, 2000.00, 'import', 14, 1, '2025-12-20 18:55:24'),
(4, 10, 'import', 100.00, 2000.00, 'import', 15, 1, '2025-12-20 19:01:44'),
(5, 12, 'import', 1.00, 0.00, 'import', 18, 1, '2025-12-21 09:28:40'),
(6, 12, 'export', 1.00, 0.00, 'invoice', 0, 1, '2025-12-21 09:28:45'),
(7, 1, 'import', 5.00, 235000.00, 'import', 19, 1, '2025-12-21 09:29:35'),
(8, 4, 'import', 3.00, 330000.00, 'import', 19, 1, '2025-12-21 09:29:35'),
(9, 5, 'import', 5.00, 215000.00, 'import', 19, 1, '2025-12-21 09:29:35'),
(10, 6, 'import', 5.00, 315000.00, 'import', 19, 1, '2025-12-21 09:29:35'),
(11, 1, 'export', 1.00, 0.00, 'invoice', 0, 1, '2025-12-22 17:38:18'),
(12, 2, 'import', 5.00, 75000.00, 'import', 20, 1, '2025-12-22 17:40:56'),
(13, 3, 'import', 5.00, 75000.00, 'import', 20, 1, '2025-12-22 17:40:56'),
(14, 7, 'import', 3.00, 60000.00, 'import', 20, 1, '2025-12-22 17:40:56'),
(15, 2, 'export', 1.00, 0.00, 'invoice', 0, 1, '2025-12-22 17:41:39'),
(28, 8, 'import', 20.70, 2200.00, 'import', 21, 1, '2025-12-31 09:22:55'),
(29, 9, 'import', 100.00, 900.00, 'import', 21, 1, '2025-12-31 09:22:55'),
(48, 8, 'export', 1.00, 0.00, 'invoice', 43, 1, '2025-12-31 14:20:12'),
(49, 4, 'export', 0.40, 0.00, 'invoice', 44, 1, '2025-12-31 14:21:02'),
(50, 6, 'export', 0.30, 0.00, 'invoice', 71, 1, '2026-01-01 13:48:58'),
(51, 2, 'export', 0.40, 0.00, 'invoice', 71, 1, '2026-01-01 13:48:58'),
(52, 11, 'import', 10.00, 10000.00, 'import', 22, 1, '2026-01-01 13:49:53'),
(53, 11, 'export', 1.00, 0.00, 'invoice', 73, 1, '2026-01-01 13:50:09'),
(56, 16, 'import', 2.00, 7000.00, 'import', 23, 1, '2026-01-05 06:41:13'),
(57, 16, 'import', 2.00, 7000.00, 'import', 24, 1, '2026-01-05 06:41:34'),
(61, 18, 'import', 24.00, 7000.00, 'import', 25, 1, '2026-01-05 06:43:02'),
(66, 19, 'import', 24.00, 5000.00, 'import', 26, 1, '2026-01-05 06:43:21'),
(67, 7, 'export', 0.40, 0.00, 'invoice', 78, 1, '2026-01-05 06:43:24'),
(68, 10, 'export', 10.00, 0.00, 'invoice', 78, 1, '2026-01-05 06:43:24'),
(69, 16, 'export', 0.50, 0.00, 'invoice', 78, 1, '2026-01-05 06:43:24'),
(70, 18, 'export', 1.00, 0.00, 'invoice', 78, 1, '2026-01-05 06:43:24'),
(71, 19, 'export', 1.00, 0.00, 'invoice', 78, 1, '2026-01-05 06:43:24'),
(72, 17, 'import', 10.00, 100000.00, 'import', 27, 1, '2026-01-05 16:38:25'),
(73, 15, 'import', 1.00, 250000.00, 'import', 28, 1, '2026-01-05 16:57:43'),
(74, 17, 'export', 2.00, 0.00, 'invoice', 100000, 1, '2026-01-05 16:59:42'),
(75, 7, 'export', 0.40, 0.00, 'invoice', 95, 1, '2026-01-05 17:01:07'),
(76, 6, 'export', 0.30, 0.00, 'invoice', 96, 1, '2026-01-05 17:09:03'),
(77, 2, 'export', 0.40, 0.00, 'invoice', 96, 1, '2026-01-05 17:09:03'),
(78, 8, 'export', 5.00, 0.00, 'invoice', 96, 1, '2026-01-05 17:09:03'),
(79, 14, 'import', 1.00, 230000.00, 'import', 29, 1, '2026-01-05 17:11:19'),
(80, 13, 'import', 10.00, 13000.00, 'import', 30, 1, '2026-01-05 17:13:59'),
(81, 12, 'import', 10.00, 3500.00, 'import', 31, 1, '2026-01-05 17:17:57');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `invoice`
--

CREATE TABLE `invoice` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `table_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `promotion_id` bigint(20) DEFAULT NULL,
  `total` decimal(12,2) DEFAULT 0.00,
  `discount` decimal(12,2) DEFAULT 0.00,
  `pay_amount` decimal(12,2) DEFAULT 0.00,
  `payment_method` enum('cash','transfer','card') NOT NULL DEFAULT 'cash',
  `status` enum('serving','completed','cancel') DEFAULT 'serving',
  `time_start` timestamp NOT NULL DEFAULT current_timestamp(),
  `time_end` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `invoice`
--

INSERT INTO `invoice` (`id`, `code`, `table_id`, `user_id`, `promotion_id`, `total`, `discount`, `pay_amount`, `payment_method`, `status`, `time_start`, `time_end`) VALUES
(1, 'HD000001', 4, 1, NULL, 238000.00, 0.00, 238000.00, 'cash', 'completed', '2025-12-19 08:45:20', '2025-12-19 08:45:20'),
(2, 'HD000002', 14, 1, NULL, 697000.00, 0.00, 697000.00, 'cash', 'completed', '2025-12-19 13:36:33', '2025-12-19 13:36:33'),
(3, 'HD000003', 17, 1, NULL, 289000.00, 57800.00, 231200.00, 'cash', 'completed', '2025-12-19 13:36:49', '2025-12-19 13:36:49'),
(4, 'HD000004', 5, 1, NULL, 625000.00, 0.00, 625000.00, 'cash', 'completed', '2025-12-19 13:53:13', '2025-12-19 13:53:13'),
(5, 'HD000005', 5, 1, NULL, 625000.00, 0.00, 625000.00, 'cash', 'completed', '2025-12-19 13:53:48', '2025-12-19 13:53:48'),
(6, 'HD000006', 4, 1, NULL, 350000.00, 0.00, 350000.00, 'cash', 'completed', '2025-12-19 13:57:21', '2025-12-19 13:57:21'),
(7, 'HD000007', 12, 1, NULL, 400000.00, 0.00, 400000.00, 'transfer', 'completed', '2025-12-19 14:00:56', '2025-12-19 14:00:56'),
(8, 'HD000008', 3, 1, NULL, 350000.00, 0.00, 350000.00, 'transfer', 'completed', '2025-12-19 17:15:08', '2025-12-19 17:15:08'),
(9, 'HD000009', 16, 1, NULL, 5501000.00, 0.00, 5501000.00, 'card', 'completed', '2025-12-19 17:21:14', '2025-12-19 17:21:14'),
(10, 'HD000010', 10, 1, NULL, 350000.00, 0.00, 350000.00, 'cash', 'completed', '2025-12-19 17:33:41', '2025-12-19 17:33:41'),
(11, 'HD000011', 14, 1, NULL, 300000.00, 0.00, 300000.00, 'transfer', 'completed', '2025-12-19 17:39:24', '2025-12-19 17:39:40'),
(12, 'HD000012', 22, 1, NULL, 250000.00, 0.00, 250000.00, 'transfer', 'completed', '2025-12-19 17:41:10', '2025-12-19 17:41:32'),
(13, 'HD000013', 2, 1, NULL, 1328000.00, 0.00, 1328000.00, 'transfer', 'completed', '2025-12-19 17:44:29', '2025-12-19 17:45:20'),
(14, 'HD000014', 1, 1, NULL, 59000.00, 0.00, 59000.00, 'cash', 'completed', '2025-12-19 17:47:23', '2025-12-19 17:54:34'),
(24, 'HD000015', 15, 1, NULL, 175000.00, 0.00, 175000.00, 'cash', 'completed', '2025-12-20 18:14:54', '2025-12-20 18:21:54'),
(26, 'HD000016', 10, 1, NULL, 60000.00, 0.00, 60000.00, 'transfer', 'completed', '2025-12-20 18:44:18', '2025-12-20 18:53:34'),
(27, 'HD000017', 11, 1, NULL, 400000.00, 0.00, 400000.00, 'transfer', 'completed', '2025-12-26 13:40:47', '2025-12-26 15:09:40'),
(28, 'HD000018', 5, 1, NULL, 350000.00, 0.00, 350000.00, 'card', 'completed', '2025-12-26 13:40:53', '2025-12-26 15:12:41'),
(29, 'HD000019', 30, 1, NULL, 300000.00, 0.00, 300000.00, 'cash', 'completed', '2025-12-26 13:40:50', '2025-12-26 15:15:52'),
(32, 'HD000020', 16, 1, NULL, 350000.00, 0.00, 350000.00, 'transfer', 'completed', '2025-12-27 17:50:45', '2025-12-27 17:52:08'),
(33, 'HD000021', 2, 1, NULL, 350000.00, 0.00, 350000.00, 'cash', 'completed', '2025-12-27 16:45:29', '2025-12-30 16:26:52'),
(34, 'HD000022', 2, 1, 1, 400000.00, 0.00, 400000.00, 'cash', 'completed', '2025-12-30 16:27:18', '2025-12-30 17:35:45'),
(36, 'HD000023', 1, 1, 1, 59000.00, 5900.00, 53100.00, 'transfer', 'completed', '2025-12-27 17:50:25', '2025-12-31 08:13:41'),
(37, 'HD000024', 1, 1, NULL, 99000.00, 0.00, 99000.00, 'cash', 'completed', '2025-12-31 08:18:25', '2025-12-31 08:18:31'),
(38, 'HD000025', 4, 1, NULL, 99000.00, 0.00, 99000.00, 'transfer', 'completed', '2025-12-27 16:45:23', '2025-12-31 08:22:51'),
(42, 'HD000026', 16, 1, NULL, 350000.00, 0.00, 350000.00, 'transfer', 'completed', '2025-12-31 14:19:51', '2025-12-31 14:19:55'),
(43, 'HD000027', 4, 1, NULL, 5000.00, 0.00, 5000.00, 'transfer', 'completed', '2025-12-31 14:15:02', '2025-12-31 14:20:12'),
(44, 'HD000028', 9, 1, NULL, 250000.00, 0.00, 250000.00, 'cash', 'completed', '2025-12-27 17:48:55', '2025-12-31 14:21:02'),
(47, 'HD000029', 3, 1, NULL, 350000.00, 0.00, 350000.00, 'transfer', 'completed', '2025-12-27 16:45:23', '2025-12-31 14:28:04'),
(48, 'HD000030', 3, 1, NULL, 350000.00, 0.00, 350000.00, 'cash', 'completed', '2025-12-27 16:45:23', '2025-12-31 14:28:35'),
(49, 'HD000031', 3, 1, NULL, 350000.00, 0.00, 350000.00, 'transfer', 'completed', '2025-12-27 16:45:23', '2025-12-31 14:31:22'),
(71, 'HD000032', 9, 1, 2, 764000.00, 76400.00, 687600.00, 'transfer', 'completed', '2026-01-01 13:48:21', '2026-01-01 13:48:58'),
(73, 'HD000033', 2, 1, NULL, 40000.00, 0.00, 40000.00, 'transfer', 'completed', '2025-12-31 14:21:51', '2026-01-01 13:50:09'),
(74, 'HD000034', 47, 1, NULL, 400000.00, 0.00, 400000.00, 'transfer', 'completed', '2026-01-05 06:36:54', '2026-01-05 06:37:09'),
(78, 'HD000035', 18, 1, NULL, 514000.00, 0.00, 514000.00, 'transfer', 'completed', '2026-01-05 06:39:34', '2026-01-05 06:43:24'),
(95, 'HD000052', 5, 1, NULL, 640000.00, 0.00, 640000.00, 'transfer', 'completed', '2026-01-05 17:00:50', '2026-01-05 17:01:07'),
(96, 'HD000053', 2, 1, NULL, 528000.00, 0.00, 528000.00, 'transfer', 'completed', '2026-01-05 17:08:42', '2026-01-05 17:09:03');

--
-- Bẫy `invoice`
--
DELIMITER $$
CREATE TRIGGER `invoice_before_insert` BEFORE INSERT ON `invoice` FOR EACH ROW BEGIN
    DECLARE new_id BIGINT;
    SELECT last_id + 1 INTO new_id FROM id_counters WHERE table_name='invoice';
    SET NEW.code = CONCAT('HD', LPAD(new_id,6,'0'));
    UPDATE id_counters SET last_id=new_id WHERE table_name='invoice';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `invoice_detail`
--

CREATE TABLE `invoice_detail` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `invoice_id` bigint(20) UNSIGNED DEFAULT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `price` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `invoice_detail`
--

INSERT INTO `invoice_detail` (`id`, `invoice_id`, `product_id`, `quantity`, `price`, `created_at`) VALUES
(1, 1, 42, 1, 119000.00, '2025-12-19 08:45:20'),
(2, 1, 44, 1, 119000.00, '2025-12-19 08:45:20'),
(3, 2, 3, 1, 350000.00, '2025-12-19 13:36:33'),
(4, 2, 42, 1, 119000.00, '2025-12-19 13:36:33'),
(5, 2, 43, 1, 109000.00, '2025-12-19 13:36:33'),
(6, 2, 44, 1, 119000.00, '2025-12-19 13:36:33'),
(7, 3, 9, 1, 250000.00, '2025-12-19 13:36:49'),
(8, 3, 64, 1, 39000.00, '2025-12-19 13:36:49'),
(9, 4, 13, 1, 145000.00, '2025-12-19 13:53:13'),
(10, 4, 15, 1, 175000.00, '2025-12-19 13:53:13'),
(11, 4, 18, 1, 175000.00, '2025-12-19 13:53:13'),
(12, 4, 24, 1, 80000.00, '2025-12-19 13:53:13'),
(13, 4, 30, 1, 50000.00, '2025-12-19 13:53:13'),
(14, 5, 13, 1, 145000.00, '2025-12-19 13:53:48'),
(15, 5, 15, 1, 175000.00, '2025-12-19 13:53:48'),
(16, 5, 18, 1, 175000.00, '2025-12-19 13:53:48'),
(17, 5, 24, 1, 80000.00, '2025-12-19 13:53:48'),
(18, 5, 30, 1, 50000.00, '2025-12-19 13:53:48'),
(19, 6, 2, 1, 350000.00, '2025-12-19 13:57:21'),
(20, 7, 1, 1, 400000.00, '2025-12-19 14:00:56'),
(21, 8, 2, 1, 350000.00, '2025-12-19 17:15:08'),
(22, 9, 1, 3, 400000.00, '2025-12-19 17:21:14'),
(23, 9, 13, 3, 145000.00, '2025-12-19 17:21:14'),
(24, 9, 15, 3, 175000.00, '2025-12-19 17:21:14'),
(25, 9, 22, 3, 65000.00, '2025-12-19 17:21:14'),
(26, 9, 23, 3, 80000.00, '2025-12-19 17:21:14'),
(27, 9, 26, 10, 5000.00, '2025-12-19 17:21:14'),
(28, 9, 28, 3, 60000.00, '2025-12-19 17:21:14'),
(29, 9, 29, 3, 40000.00, '2025-12-19 17:21:14'),
(30, 9, 31, 3, 55000.00, '2025-12-19 17:21:14'),
(31, 9, 33, 3, 60000.00, '2025-12-19 17:21:14'),
(32, 9, 34, 3, 40000.00, '2025-12-19 17:21:14'),
(33, 9, 36, 3, 60000.00, '2025-12-19 17:21:14'),
(34, 9, 37, 3, 150000.00, '2025-12-19 17:21:14'),
(35, 9, 38, 3, 170000.00, '2025-12-19 17:21:14'),
(36, 9, 43, 3, 109000.00, '2025-12-19 17:21:14'),
(37, 9, 57, 3, 99000.00, '2025-12-19 17:21:14'),
(38, 9, 59, 5, 20000.00, '2025-12-19 17:21:14'),
(39, 9, 60, 5, 20000.00, '2025-12-19 17:21:14'),
(40, 9, 61, 1, 39000.00, '2025-12-19 17:21:14'),
(41, 9, 62, 1, 29000.00, '2025-12-19 17:21:14'),
(42, 9, 63, 1, 20000.00, '2025-12-19 17:21:14'),
(43, 9, 64, 1, 39000.00, '2025-12-19 17:21:14'),
(44, 10, 2, 1, 350000.00, '2025-12-19 17:33:41'),
(45, 11, 5, 1, 300000.00, '2025-12-19 17:39:40'),
(46, 12, 12, 1, 250000.00, '2025-12-19 17:41:32'),
(47, 13, 1, 1, 400000.00, '2025-12-19 17:44:20'),
(48, 13, 13, 1, 145000.00, '2025-12-19 17:44:20'),
(49, 13, 23, 1, 80000.00, '2025-12-19 17:44:20'),
(50, 13, 31, 1, 55000.00, '2025-12-19 17:44:20'),
(51, 13, 33, 1, 60000.00, '2025-12-19 17:44:20'),
(52, 13, 34, 1, 40000.00, '2025-12-19 17:44:20'),
(53, 13, 35, 1, 50000.00, '2025-12-19 17:44:20'),
(54, 13, 37, 1, 150000.00, '2025-12-19 17:44:20'),
(55, 13, 38, 1, 170000.00, '2025-12-19 17:44:20'),
(56, 13, 43, 1, 109000.00, '2025-12-19 17:44:20'),
(57, 13, 50, 1, 69000.00, '2025-12-19 17:44:20'),
(58, 14, 51, 1, 59000.00, '2025-12-19 17:44:34'),
(68, 24, 15, 1, 175000.00, '2025-12-20 18:21:54'),
(70, 26, 33, 1, 60000.00, '2025-12-20 18:53:34'),
(71, 27, 1, 1, 400000.00, '2025-12-26 15:09:40'),
(72, 28, 3, 1, 350000.00, '2025-12-26 15:12:41'),
(73, 29, 5, 1, 300000.00, '2025-12-26 15:15:52'),
(96, 32, 3, 1, 350000.00, '2025-12-27 17:52:08'),
(97, 33, 2, 1, 350000.00, '2025-12-30 16:26:52'),
(98, 34, 1, 1, 400000.00, '2025-12-30 17:35:45'),
(118, 36, 51, 1, 59000.00, '2025-12-31 08:13:41'),
(119, 37, 54, 1, 99000.00, '2025-12-31 08:18:31'),
(120, 38, 56, 1, 99000.00, '2025-12-31 08:22:51'),
(178, 42, 2, 1, 350000.00, '2025-12-31 14:19:55'),
(179, 43, 26, 1, 5000.00, '2025-12-31 14:20:12'),
(180, 44, 12, 1, 250000.00, '2025-12-31 14:21:02'),
(183, 47, 3, 1, 350000.00, '2025-12-31 14:28:04'),
(184, 48, 3, 1, 350000.00, '2025-12-31 14:28:35'),
(185, 49, 3, 1, 350000.00, '2025-12-31 14:31:22'),
(207, 71, 1, 1, 400000.00, '2026-01-01 13:48:58'),
(208, 71, 15, 1, 175000.00, '2026-01-01 13:48:58'),
(209, 71, 23, 1, 80000.00, '2026-01-01 13:48:58'),
(210, 71, 43, 1, 109000.00, '2026-01-01 13:48:58'),
(212, 73, 34, 1, 40000.00, '2026-01-01 13:50:09'),
(213, 74, 1, 1, 400000.00, '2026-01-05 06:37:09'),
(232, 78, 5, 1, 300000.00, '2026-01-05 06:43:24'),
(233, 78, 21, 1, 65000.00, '2026-01-05 06:43:24'),
(234, 78, 33, 1, 60000.00, '2026-01-05 06:43:24'),
(235, 78, 45, 1, 49000.00, '2026-01-05 06:43:24'),
(236, 78, 59, 1, 20000.00, '2026-01-05 06:43:24'),
(237, 78, 60, 1, 20000.00, '2026-01-05 06:43:24'),
(238, 95, 1, 1, 400000.00, '2026-01-05 17:01:07'),
(239, 95, 18, 1, 175000.00, '2026-01-05 17:01:07'),
(240, 95, 21, 1, 65000.00, '2026-01-05 17:01:07'),
(241, 96, 15, 1, 175000.00, '2026-01-05 17:09:03'),
(242, 96, 23, 1, 80000.00, '2026-01-05 17:09:03'),
(243, 96, 26, 3, 5000.00, '2026-01-05 17:09:03'),
(244, 96, 28, 1, 60000.00, '2026-01-05 17:09:03'),
(245, 96, 58, 2, 99000.00, '2026-01-05 17:09:03');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `location`
--

CREATE TABLE `location` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(150) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `name` varchar(150) NOT NULL,
  `capacity` int(11) DEFAULT NULL,
  `area` decimal(8,2) DEFAULT NULL,
  `floors` int(11) DEFAULT NULL,
  `time_start` time DEFAULT NULL,
  `time_end` time DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `location`
--

INSERT INTO `location` (`id`, `code`, `status`, `name`, `capacity`, `area`, `floors`, `time_start`, `time_end`, `created_at`) VALUES
(1, 'tbqdonghia', 'active', 'U04-L18, KĐT Đô Nghĩa', 200, 400.00, 2, '09:00:00', '02:00:00', '2025-11-25 19:27:41');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `product`
--

CREATE TABLE `product` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `category_id` bigint(20) UNSIGNED DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `name` varchar(150) NOT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `type_menu` enum('Food','Drink','Other') DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `product`
--

INSERT INTO `product` (`id`, `code`, `category_id`, `img`, `name`, `unit`, `type_menu`, `price`, `created_at`) VALUES
(1, 'SP000001', 1, 'images/product/lau-thai-tomyum.jpg', 'Lẩu Thái Tomyum', 'Nồi', 'Food', 400000.00, '2025-11-25 19:31:12'),
(2, 'SP000002', 1, 'images/product/lau-rieu-cua.jpg', 'Lẩu Riêu Cua', 'Nồi', 'Food', 350000.00, '2025-11-25 19:41:13'),
(3, 'SP000003', 1, 'images/product/lau-oc-nhoi.jpg', 'Lẩu Ốc Nhồi', 'Nồi', 'Food', 350000.00, '2025-12-01 06:28:09'),
(4, 'SP000004', 1, 'images/product/lau-ech.jpg', 'Lẩu Ếch', 'Nồi', 'Food', 250000.00, '2025-12-01 06:28:09'),
(5, 'SP000005', 1, 'images/product/lau-bo-nhung-dam.jpg', 'Lẩu Bò Nhúng Dấm', 'Nồi', 'Food', 300000.00, '2025-12-08 09:27:42'),
(6, 'SP000006', 2, 'images/product/muc-hap-sa.jpg', 'Mực Hấp Sả', 'Đĩa', 'Food', 255000.00, '2025-12-09 14:15:13'),
(7, 'SP000007', 2, 'images/product/muc-chien-mam.jpg', 'Mực Chiên Mắm', 'Đĩa', 'Food', 255000.00, '2025-12-09 17:03:30'),
(8, 'SP000008', 2, 'images/product/muc-chien-bo-toi.jpg', 'Mực Chiên Bơ Tỏi', 'Đĩa', 'Food', 255000.00, '2025-12-09 17:06:30'),
(9, 'SP000009', 2, 'images/product/tom-hap.jpg', 'Tôm Hấp', 'Đĩa', 'Food', 250000.00, '2025-12-09 17:15:47'),
(10, 'SP000010', 2, 'images/product/tom-nuong-moi.jpg', 'Tôm Nướng Mọi', 'Đĩa', 'Food', 250000.00, '2025-12-09 17:18:34'),
(11, 'SP000011', 2, 'images/product/tom-rang-muoi.jpg', 'Tôm Rang Muối', 'Đĩa', 'Food', 250000.00, '2025-12-09 17:20:28'),
(12, 'SP000012', 2, 'images/product/tom-pho-mai-bo-lo.jpg', 'Tôm Phô Mai Bỏ Lò', 'Đĩa', 'Food', 250000.00, '2025-12-09 17:29:04'),
(13, 'SP000013', 2, 'images/product/bach-tuoc-hap-sa.jpg', 'Bạch Tuộc Hấp Sả', 'Đĩa', 'Food', 145000.00, '2025-12-09 17:55:43'),
(14, 'SP000014', 2, 'images/product/bach-tuoc-nuong-sa-te.jpeg', 'Bạch Tuộc Nướng Sa Tế', 'kg', 'Food', 155000.00, '2025-12-09 18:11:30'),
(15, 'SP000015', 2, 'images/product/oc-huong-sot-trung-muoi.jpg', 'Ốc Hương Sốt Trứng Muối', 'Đĩa', 'Food', 175000.00, '2025-12-10 07:48:19'),
(16, 'SP000016', 2, 'images/product/oc-huong-sot-bo-toi.jpg', 'Ốc Hương Sốt Bơ Tỏi', 'Đĩa', 'Food', 175000.00, '2025-12-10 07:49:50'),
(17, 'SP000017', 2, 'images/product/oc-huong-nuong-moi.jpg', 'Ốc Hương Nướng Mọi', 'Đĩa', 'Food', 175000.00, '2025-12-10 07:50:49'),
(18, 'SP000018', 2, 'images/product/oc-huong-chay-toi-top-mo.jpg', 'Ốc Hương Cháy Tỏi Tóp Mỡ', 'Đĩa', 'Food', 175000.00, '2025-12-10 09:48:22'),
(19, 'SP000019', 3, 'images/product/chan-ga-chien-mam.jpg', 'Chân Gà Chiên Mắm', 'Đĩa', 'Food', 65000.00, '2025-12-10 09:52:11'),
(20, 'SP000020', 3, 'images/product/chan-ga-nuong-sa-te.jpg', 'Chân Gà Nướng Sa Tế', 'Đĩa', 'Food', 65000.00, '2025-12-10 09:54:19'),
(21, 'SP000021', 3, 'images/product/chan-ga-sot-thai.jpg', 'Chân Gà Sốt Thái', 'Đĩa', 'Food', 65000.00, '2025-12-10 09:56:27'),
(22, 'SP000022', 3, 'images/product/chan-ga-sa-tac.jpg', 'Chân Gà Sả Tắc', 'Đĩa', 'Food', 65000.00, '2025-12-10 09:57:11'),
(23, 'SP000023', 4, 'images/product/canh-ga-chien-mam.jpg', 'Cánh Gà Chiên Mắm', 'Đĩa', 'Food', 80000.00, '2025-12-10 09:58:54'),
(24, 'SP000024', 4, 'images/product/canh-ga-nuong-mat-ong.jpg', 'Cánh Gà Nướng Mật Ong', 'Đĩa', 'Food', 80000.00, '2025-12-10 09:59:54'),
(25, 'SP000025', 4, 'images/product/canh-ga-nuong-sa-te.jpg', 'Cánh Gà Nướng Sa Tế', 'Đĩa', 'Food', 80000.00, '2025-12-10 10:00:52'),
(26, 'SP000026', 5, 'images/product/banh-mi.jpg', 'Bánh Mì', 'Cái', 'Food', 5000.00, '2025-12-10 10:02:20'),
(27, 'SP000027', 5, 'images/product/banh-mi-bo-mat-ong.jpg', 'Bánh Mì Bơ Mật Ong', 'Cái', 'Food', 10000.00, '2025-12-10 10:05:28'),
(28, 'SP000028', 5, 'images/product/banh-mi-phomai.jpg', 'Bánh Mì Phomai', 'Đĩa', 'Food', 60000.00, '2025-12-10 10:09:11'),
(29, 'SP000029', 5, 'images/product/khoai-tay-chien.jpg', 'Khoai Tây Chiên', 'Đĩa', 'Food', 40000.00, '2025-12-10 10:10:42'),
(30, 'SP000030', 5, 'images/product/khoai-tay-lac-phomai.jpg', 'Khoai Tây Lắc Phomai', 'Đĩa', 'Food', 50000.00, '2025-12-10 10:11:52'),
(31, 'SP000031', 5, 'images/product/cut-lon-xao-me.jpg', 'Cút Lộn Xào Me', 'Đĩa', 'Food', 55000.00, '2025-12-10 10:13:42'),
(32, 'SP000032', 5, 'images/product/cut-lon-luoc.jpg', 'Cút Lộn Luộc', 'Đĩa', 'Food', 45000.00, '2025-12-10 10:14:43'),
(33, 'SP000033', 5, 'images/product/nem-chua-ran.jpg', 'Nem Chua Rán', 'Đĩa', 'Food', 60000.00, '2025-12-10 10:17:19'),
(34, 'SP000034', 5, 'images/product/ngo-chien.jpg', 'Ngô Chiên', 'Đĩa', 'Food', 40000.00, '2025-12-10 10:18:50'),
(35, 'SP000035', 6, 'images/product/dau-phu-ran.jpg', 'Đậu Phụ Rán', 'Đĩa', 'Food', 50000.00, '2025-12-10 13:28:23'),
(36, 'SP000036', 6, 'images/product/dau-phu-tam-hanh.jpg', 'Đậu Phụ Tẩm Hành', 'Đĩa', 'Food', 60000.00, '2025-12-10 13:29:42'),
(37, 'SP000037', 6, 'images/product/top-mo-chay-toi.jpg', 'Tóp Mỡ Cháy Tỏi', 'Đĩa', 'Food', 150000.00, '2025-12-10 13:31:59'),
(38, 'SP000038', 6, 'images/product/bo-xao-mang-truc.jpg', 'Bò Xào Măng Trúc', 'Đĩa', 'Food', 170000.00, '2025-12-10 13:35:48'),
(39, 'SP000039', 6, 'images/product/trau-xao-rau-muong.jpg', 'Trâu Xào Rau Muống', 'Đĩa', 'Food', 160000.00, '2025-12-10 13:39:24'),
(40, 'SP000040', 6, 'images/product/ech-chien.jpg', 'Ếch Chiên', 'Đĩa', 'Food', 100000.00, '2025-12-10 13:42:53'),
(41, 'SP000041', 6, 'images/product/nam-sua-nuong-gieng-me.jpg', 'Nầm Sữa Nướng Giềng Mẻ', 'Đĩa', 'Food', 189000.00, '2025-12-10 14:41:46'),
(42, 'SP000042', 7, 'images/product/goi-chan-ga-tron-thinh.jpg', 'Gỏi Chân Gà Trộn Thính', 'kg', 'Food', 119000.00, '2025-12-10 14:43:32'),
(43, 'SP000043', 7, 'images/product/salad-ca-ngu.jpg', 'Salad Cá Ngừ', 'Đĩa', 'Food', 109000.00, '2025-12-10 14:45:01'),
(44, 'SP000044', 7, 'images/product/salad-sot-chanh-leo.jpg', 'Salad Sốt Chanh Leo', 'Đĩa', 'Food', 119000.00, '2025-12-10 14:45:46'),
(45, 'SP000045', 8, 'images/product/rau-muong-xao.jpg', 'Rau Muống Xào', 'Đĩa', 'Food', 49000.00, '2025-12-10 14:47:29'),
(46, 'SP000046', 8, 'images/product/cu-qua-luoc-cham-kho-quet.jpg', 'Củ Quả Luộc Chấm Kho Quẹt', 'Đĩa', 'Food', 99000.00, '2025-12-10 14:48:33'),
(47, 'SP000047', 8, 'images/product/top-mo-xot-ca-chua.jpg', 'Tóp Mỡ Xốt Cà Chua', 'Tô', 'Food', 89000.00, '2025-12-10 14:49:50'),
(48, 'SP000048', 8, 'images/product/oc-mong-tay-xao-rau-muong.jpg', 'Ốc Móng Tay Xào Rau Muống', 'Đĩa', 'Food', 89000.00, '2025-12-10 14:50:55'),
(49, 'SP000049', 8, 'images/product/rau-cai-xao.jpg', 'Rau Cải Xào', 'Đĩa', 'Food', 49000.00, '2025-12-10 14:52:01'),
(50, 'SP000050', 8, 'images/product/rau-cai-luoc-cham-trung.jpg', 'Rau Cải Luộc Chấm Trứng', 'Đĩa', 'Food', 69000.00, '2025-12-10 14:52:51'),
(51, 'SP000051', 9, 'images/product/chao-tom.jpg', 'Cháo Tôm', 'Bát', 'Food', 59000.00, '2025-12-10 14:56:07'),
(52, 'SP000052', 9, 'images/product/chao-hau.jpg', 'Cháo Hàu', 'Bát', 'Food', 59000.00, '2025-12-10 14:57:16'),
(53, 'SP000053', 9, 'images/product/chao-ngao.jpg', 'Cháo Ngao', 'Bát', 'Food', 59000.00, '2025-12-10 14:58:03'),
(54, 'SP000054', 10, 'images/product/com-rang-hai-san.jpg', 'Cơm Rang Hải Sản', 'Đĩa', 'Food', 99000.00, '2025-12-10 14:59:45'),
(55, 'SP000055', 10, 'images/product/com-rang-dua-bo.jpg', 'Cơm Rang Dưa Bò', 'Đĩa', 'Food', 99000.00, '2025-12-10 15:00:27'),
(56, 'SP000056', 11, 'images/product/mi-xao-bo.jpg', 'Mì Xào Bò', 'Đĩa', 'Food', 99000.00, '2025-12-10 15:01:46'),
(57, 'SP000057', 11, 'images/product/mi-xao-hai-san.jpg', 'Mì Xào Hải Sản', 'Đĩa', 'Food', 99000.00, '2025-12-10 15:02:39'),
(58, 'SP000058', 12, 'images/product/mien-xao-hai-san.jpg', 'Miến Xào Hải Sản', 'Đĩa', 'Food', 99000.00, '2025-12-10 15:03:53'),
(59, 'SP000059', 13, 'images/product/nuoc-cam-ep.jpg', 'Nước Cam Ép', 'Lon', 'Drink', 20000.00, '2025-12-10 15:20:15'),
(60, 'SP000060', 13, 'images/product/nuoc-loc.jpg', 'Nước Lọc', 'Chai', 'Drink', 20000.00, '2025-12-10 15:21:34'),
(61, 'SP000061', 14, 'images/product/dua-hau.jpg', 'Dưa Hấu', 'Đĩa', 'Other', 39000.00, '2025-12-10 15:24:08'),
(62, 'SP000062', 14, 'images/product/cu-dau.jpg', 'Củ Đậu', 'Đĩa', 'Other', 29000.00, '2025-12-10 15:26:01'),
(63, 'SP000063', 14, 'images/product/dua-chuot.jpg', 'Dưa Chuột', 'Đĩa', 'Other', 20000.00, '2025-12-10 15:27:13'),
(64, 'SP000064', 14, 'images/product/xoai.jpg', 'Xoài', 'Đĩa', 'Other', 35000.00, '2025-12-10 15:29:16');

--
-- Bẫy `product`
--
DELIMITER $$
CREATE TRIGGER `product_before_insert` BEFORE INSERT ON `product` FOR EACH ROW BEGIN
    DECLARE new_id BIGINT;
    SELECT last_id + 1 INTO new_id FROM id_counters WHERE table_name='product';
    SET NEW.code = CONCAT('SP', LPAD(new_id,6,'0'));
    UPDATE id_counters SET last_id=new_id WHERE table_name='product';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc đóng vai cho view `product_available`
-- (See below for the actual view)
--
CREATE TABLE `product_available` (
`product_id` bigint(20) unsigned
,`product_name` varchar(150)
,`available_qty` decimal(35,0)
,`cost_per_dish` decimal(46,4)
);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promotion`
--

CREATE TABLE `promotion` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `location_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `type_id` int(10) UNSIGNED NOT NULL,
  `description` text DEFAULT NULL,
  `discount` decimal(5,2) DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `promotion`
--

INSERT INTO `promotion` (`id`, `code`, `location_id`, `name`, `type_id`, `description`, `discount`, `start_date`, `end_date`, `created_at`) VALUES
(1, 'KM000001', 1, 'giảm 10% ngày sinh nhật', 1, NULL, 10.00, '2023-12-23', NULL, '2025-12-30 09:42:48'),
(2, 'KM000002', 1, 'Giảm 10% cho hóa đơn từ 500k trở lên', 1, NULL, 10.00, '2025-12-31', '2026-01-07', '2025-12-31 09:22:01');

--
-- Bẫy `promotion`
--
DELIMITER $$
CREATE TRIGGER `promotion_before_insert` BEFORE INSERT ON `promotion` FOR EACH ROW BEGIN
    DECLARE new_id BIGINT;

    SELECT last_id + 1
    INTO new_id
    FROM id_counters
    WHERE table_name = 'promotion'
    FOR UPDATE;

    SET NEW.code = CONCAT('KM', LPAD(new_id, 6, '0'));

    UPDATE id_counters
    SET last_id = new_id
    WHERE table_name = 'promotion';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promotion_type`
--

CREATE TABLE `promotion_type` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `promotion_type`
--

INSERT INTO `promotion_type` (`id`, `code`, `name`, `description`) VALUES
(1, 'percent', 'Giảm theo phần trăm', 'Khuyến mãi giảm giá theo phần trăm tổng hóa đơn'),
(3, 'amount', 'Giảm giá', 'Trừ trực tiếp tiền trong hóa đơn'),
(4, 'gift', 'Tặng quà', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `recipe`
--

CREATE TABLE `recipe` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `product_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ingredient_id` bigint(20) UNSIGNED DEFAULT NULL,
  `quantity` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `recipe`
--

INSERT INTO `recipe` (`id`, `product_id`, `ingredient_id`, `quantity`, `created_at`) VALUES
(1, 6, 1, 0.40, '2025-12-09 17:01:12'),
(2, 7, 1, 0.40, '2025-12-09 17:03:55'),
(3, 8, 1, 0.40, '2025-12-09 17:14:22'),
(4, 9, 4, 0.40, '2025-12-09 18:08:10'),
(5, 10, 4, 0.40, '2025-12-09 18:08:40'),
(6, 11, 4, 0.40, '2025-12-09 18:08:56'),
(7, 12, 4, 0.40, '2025-12-09 18:09:07'),
(8, 13, 5, 0.30, '2025-12-09 18:11:45'),
(9, 14, 5, 0.30, '2025-12-09 18:11:55'),
(10, 15, 6, 0.30, '2025-12-10 07:48:32'),
(13, 19, 3, 0.40, '2025-12-10 09:52:28'),
(14, 20, 3, 0.40, '2025-12-10 09:54:29'),
(15, 21, 7, 0.40, '2025-12-10 09:56:27'),
(16, 22, 7, 0.40, '2025-12-10 09:57:11'),
(17, 23, 2, 0.40, '2025-12-10 09:58:54'),
(18, 24, 2, 0.40, '2025-12-10 09:59:54'),
(19, 25, 2, 0.40, '2025-12-10 10:00:52'),
(20, 26, 8, 1.00, '2025-12-10 10:02:53'),
(21, 27, 8, 1.00, '2025-12-10 10:05:35'),
(22, 28, 8, 2.00, '2025-12-10 10:09:20'),
(23, 31, 9, 20.00, '2025-12-10 10:14:18'),
(25, 32, 9, 20.00, '2025-12-10 10:15:30'),
(26, 33, 10, 10.00, '2025-12-10 10:17:19'),
(27, 34, 11, 1.00, '2025-12-10 10:19:01'),
(28, 35, 12, 2.00, '2025-12-10 13:28:23'),
(29, 36, 12, 2.00, '2025-12-10 13:31:26'),
(30, 38, 14, 0.20, '2025-12-10 13:35:48'),
(31, 38, 13, 2.00, '2025-12-10 13:35:48'),
(32, 39, 16, 0.50, '2025-12-10 13:39:24'),
(33, 39, 15, 0.20, '2025-12-10 13:39:24'),
(37, 40, 17, 0.50, '2025-12-10 13:44:23'),
(38, 42, 7, 0.40, '2025-12-10 14:43:32'),
(39, 45, 16, 0.50, '2025-12-10 14:47:29'),
(40, 48, 16, 0.50, '2025-12-10 14:50:55'),
(41, 59, 18, 1.00, '2025-12-10 15:21:00'),
(42, 60, 19, 1.00, '2025-12-10 15:22:03'),
(43, 17, 6, 0.30, '2025-12-20 17:58:37'),
(44, 16, 6, 0.30, '2025-12-20 18:45:10');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `permission` text DEFAULT NULL COMMENT 'JSON hoặc ghi chú quyền của chức danh'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `roles`
--

INSERT INTO `roles` (`id`, `name`, `permission`) VALUES
(1, 'admin', NULL),
(2, 'Bếp Trưởng', NULL),
(3, 'Nhân Viên Bàn', NULL),
(4, 'Nhân Viên Phục Vụ', NULL),
(5, 'Tạp Vụ', NULL),
(6, 'Quản Lý', NULL),
(7, 'Bảo Vệ', NULL),
(8, 'Bếp Phó', NULL),
(9, 'Chảo', NULL),
(10, 'Thớt', NULL),
(11, 'Chảo Non', NULL),
(12, 'Kế Toán', NULL),
(13, 'Phụ Bếp', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(10) DEFAULT NULL,
  `location_code` varchar(50) DEFAULT NULL,
  `img` varchar(255) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `cccd` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `gender` enum('nam','nữ','khác') DEFAULT NULL,
  `role_id` bigint(20) UNSIGNED DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `status` enum('Active','Inactive') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `code`, `location_code`, `img`, `name`, `phone`, `cccd`, `email`, `password`, `dob`, `gender`, `role_id`, `start_date`, `status`, `created_at`) VALUES
(1, 'NV000001', 'tbqdonghia', '1766831587_z6964562040461_7cb24844432153850934d2efa2ae1f88.jpg', 'Nguyễn Phúc Nhật Thành', '0961581328', '001203032553', 'nhatthanh197203@gmail.com', '$2y$10$34ZZSWfpltyooeUS1fvonOZvyRpuoLmJAP6WvCJ8E04YYHKV19iKq', '2003-07-19', 'nam', 1, '2023-12-24', 'Active', '2025-11-25 19:29:14'),
(2, 'NV000002', NULL, '1765374678_bo.jpg', 'Nguyễn Phúc Hơn', '0988398455', '001077004246', 'ahon@gmail.com', '$2y$12$1vEHQrRTev8SbM7VUQnVmel2N.M/u1CheqZBy90FJH8ihSy9kbc1y', '1977-01-03', 'nam', 6, '2023-12-23', 'Active', '2025-12-10 13:45:07'),
(3, 'NV000003', NULL, '1765374460_hcm.jpg', 'Nguyễn Thị Dư', '0989115689', '001176048275', 'nguyendu@gmail.com', '$2y$12$J.4qEGpmppsyCaAiVVSeeu/3IyF4c6k4/LTptHTO7UjA9P9z1npZa', '1976-10-09', 'nữ', 12, '2023-12-23', 'Active', '2025-12-10 13:47:40'),
(4, 'NV000004', NULL, NULL, 'Nguyễn Phúc Đức', '0981678163', NULL, 'duc@gmail.com', '$2y$12$j4AYq0p448SsjU0KGSKaHOO0pxDdkGB/cyDH9NUgbQZ6wfWjwcoU.', '2003-09-17', 'nam', 3, '2025-01-10', 'Active', '2025-12-10 13:57:34'),
(5, 'NV000005', NULL, '1765375295_quynh.jpg', 'Nguyễn Thị Như Quỳnh', '0769069166', '001304038035', 'quynhquam031204@gmail.com', '$2y$12$VabJJMh9XsbhLPedPIWllu8wF28jGEjSba5IKof0GIfrTaRtA9b/K', '2004-12-03', 'nữ', 1, '2024-01-01', 'Active', '2025-12-10 14:01:35'),
(6, 'NV000006', NULL, NULL, 'Nguyễn Thu Phương', '0862888754', NULL, 'thuphuong@gmail.com', '$2y$12$zAU2Vx2MWKCl3Pjh6DDO6OUXDUn.s5YWMTIK2UtdxMFsU4AEWFJyC', '2005-05-14', 'nữ', 4, '2023-12-23', 'Active', '2025-12-10 14:08:33'),
(7, 'NV000007', NULL, NULL, 'Nguyễn Xuân Phúc', '0395861854', '042206009656', 'xphuc@gmail.com', '$2y$12$qEfZJoADWzRQcrMPG85qk.UTFNak.kQYbJ/RGUHiGJMi5AaDyQu.q', '2006-02-22', 'nam', 3, '2024-12-06', 'Active', '2025-12-10 14:10:26'),
(8, 'NV000008', NULL, NULL, 'Đỗ Hữu Hải', '0343548072', '001205003445', 'HH@gmail.com', '$2y$12$4iy6oBDs8l/xp3O2uWzaoOOJnqiTbnmLUS4LzO1EG.auZRHjTmi/e', '2005-06-03', 'nam', 3, '2025-03-20', 'Active', '2025-12-10 14:13:26'),
(9, 'NV000009', NULL, NULL, 'Nguyễn Phúc Ân', '0869428901', '001210048153', 'PAn@gmail.com', '$2y$12$56esbm0k3b52.7AO6p/cvuo62PJer3jlPL1YBFmBdL9j5VsEwVaXy', '2010-03-16', 'nam', 3, '2025-06-16', 'Active', '2025-12-10 14:14:44'),
(10, 'NV000010', NULL, NULL, 'Nguyễn Tiến Đạt', '0984646172', NULL, 'tiendat@gmail.com', '$2y$12$GyfTXlqPVykpnoe6XedJ9.CeCDlgVrTN9QOT1umPxkeLo7nddhhNK', '1992-09-12', 'nam', 2, '2023-12-30', 'Active', '2025-12-10 14:18:35'),
(11, 'NV000011', NULL, NULL, 'Đỗ Hữu Thanh', '0352031947', '001079002398', NULL, '$2y$12$AvRFPU3zb3sR6YPuo6NewuT04BzUdJDi4gSelQmrDWZLhHU23aNUq', '1979-09-26', 'nam', 7, '2025-02-04', 'Active', '2025-12-10 14:19:50'),
(12, 'NV000012', NULL, NULL, 'Nguyễn Văn Cao', '0983366488', NULL, NULL, '$2y$12$GhpoV10Aj9kVykamwa5Jxep7gf.hj5zKEULmhQF07pAVh3vniZ7.a', '2003-11-05', 'nam', 11, '2024-07-01', 'Active', '2025-12-10 14:26:51'),
(13, 'NV000013', NULL, NULL, 'Điền Hải Phong', '0817676151', '00130223153', NULL, '$2y$12$69en3YBDHe8jow1Rtc1nUu/UxgUOUNlxwGogElG5xdlx2oz/wKjHC', '2000-12-10', 'nam', 9, '2024-01-11', 'Active', '2025-12-10 14:28:30'),
(14, 'NV000014', NULL, NULL, 'Nguyễn Văn Thuấn', '0865135155', NULL, NULL, '$2y$12$3JyIt.z64IWGOYbtl2QMseZQGfoY95XXbN.JFAsxbNpVmfdvqU6iC', '1993-03-12', 'nam', 8, '2023-12-23', 'Active', '2025-12-10 14:29:39'),
(15, 'NV000015', NULL, NULL, 'Hoàng Thị Đào', '0948096154', '008179000601', NULL, '$2y$12$33fehEGr4l.FDL1VdJfxIuCYuYL1ZGmWb6I8o0Vudfai4Ous.Tw6.', '1979-08-25', 'nữ', 13, '2024-12-31', 'Active', '2025-12-10 14:32:26'),
(16, 'NV000016', NULL, NULL, 'Nguyễn Minh Huệ', '0987125120', '001207695314', NULL, '$2y$12$nO1Kaxo1BiESQ18kOmIYUOxPc0OT6FBc5XPNlQxJZyiyTFOBUl/P.', '2005-04-06', 'nữ', 4, '2024-04-12', 'Active', '2025-12-10 14:34:13'),
(17, 'NV000017', NULL, NULL, 'Nguyễn Ngọc Huyền', '0900617117', '001177004246', NULL, '$2y$12$uxz73qBEud./n5I7uQek4Omf9K.uCioZVb36dIo1mhO53tZQq0hA6', '1966-02-15', 'nữ', 5, '2023-12-23', 'Active', '2025-12-10 14:37:58'),
(18, 'NV000018', NULL, NULL, 'Hoàng Đức Mạnh', '0769046385', '001212132553', NULL, '$2y$12$95GCp3T93u.8Pv7ztCyez.f5yKZ4iASKTazsB8lPkSq5oQAUsryc6', '2005-12-16', 'nam', 3, '2024-08-18', 'Active', '2025-12-10 16:07:41'),
(19, 'NV000019', NULL, NULL, 'Nguyễn Đắc Thắng', '0987962125', '001216348153', NULL, '$2y$12$BIluHkkafd4LveXFj338eeiFEWfJtWbAmKlH.idb/zGquPPf1mcBS', '1999-03-19', 'nam', 10, '2024-08-18', 'Active', '2025-12-10 16:09:00'),
(20, 'NV000020', NULL, NULL, 'Nguyễn Thế Đức', '0969172190', '001276748621', NULL, '$2y$12$v3gm01mi10HjzvMOP9.zF.pD3U9xB8gRBJuX5fU6cOLJNtjKGl0d2', '1997-08-08', 'nam', 10, '2024-09-18', 'Active', '2025-12-10 16:10:14'),
(21, 'NV000021', NULL, NULL, 'Đỗ Bảo Minh', '0917625152', '001082946357', NULL, '$2y$12$G7fRb/MEG9.VZ9U7LWvuDO8/LKaat9ANiMaSQdeUpZdnGB9CBzGMO', '1995-04-18', 'nam', 13, '2024-08-19', 'Active', '2025-12-10 16:12:46'),
(22, 'NV000022', NULL, NULL, 'Nguyễn Vân Khánh', '0782413116', '001306022614', 'thanh197203@gmail.com', '$2y$12$AsRkuaGb9pI54rYHRF//d.Ss/Smc8ZQMEfYSyju5m2J4SYTxUP6I.', '2006-04-14', 'nữ', 4, '2024-08-05', 'Active', '2025-12-10 16:14:17'),
(23, 'NV000023', NULL, NULL, 'Phạm Thị Thúy Ngọc', '0984215763', '012345678912', 'thanh197203@gmail.com', '$2y$12$rUe00azchjHW.UgWSftfBOgQ/Ajemyyd5iO1ue4lmvLEzGbGrwieK', '1999-02-25', 'nữ', 4, '2025-09-08', 'Active', '2025-12-10 16:17:53'),
(24, 'NV000024', NULL, NULL, 'Trần Thu Hà', '0912673804', '001362813547', NULL, '$2y$12$TEXnxovqH1T2Eehf0v2q0enQZaKO3JCSXxbP5WHVjuV5ToGH80OYu', '2000-10-22', 'nữ', 4, '2024-09-12', 'Active', '2025-12-10 16:19:59'),
(25, 'NV000025', NULL, NULL, 'Nguyễn Ngọc Trang', '0976582140', '001328451620', NULL, '$2y$12$wabQ3cJaZquI1z3zTb3Uu.K7DLApsukhwEDzg96kTt0ZWkd.OS9zO', '2005-11-25', 'nữ', 4, '2025-03-04', 'Active', '2025-12-10 16:22:07'),
(26, 'NV000026', NULL, NULL, 'Vũ Đức Huấn', '0935720465', '001114237508', NULL, '$2y$12$Wt4p.BQsTAjHg/qfQH8g2O.UTrnKriEPFzgedhsn27.VE6Xg3WKkO', '1994-06-01', 'nam', 9, '2025-02-26', 'Active', '2025-12-10 16:23:18'),
(27, 'NV000027', NULL, NULL, 'Nguyễn Văn Nghĩa', '0889134507', '001239284610', NULL, '$2y$12$GKCr67vM8yR6Ni/yItYm6eQaYyXdXX1HvuR3aqlRgvhbNmWdSeZ1a', '2000-05-05', 'nam', 11, '2025-01-01', 'Active', '2025-12-10 16:24:27'),
(28, 'NV000028', NULL, NULL, 'Nguyễn Mai Hoa', '0857903621', '001321975430', NULL, '$2y$12$ySi.uxtNAS0/ptXiB6JApuwiL.3BlNmNasKyq6eY13Cn4SiysxSgm', '2008-06-15', 'nữ', 4, '2025-02-02', 'Active', '2025-12-10 16:26:41'),
(29, 'NV000029', NULL, NULL, 'Nguyễn Huyền Nhung', '0963748210', '001384726510', NULL, '$2y$12$JQ5OrC5Yizp1Rbz7Iar6g.SurvpuLKRagvGeP8Ps70hlPi0XKsAHS', '2006-12-10', 'nữ', 4, '2024-11-04', 'Active', '2025-12-10 16:29:22'),
(30, 'NV000030', NULL, NULL, 'Trần Khánh Linh', '0908452379', '001318349602', NULL, '$2y$12$gXvoCRyaOj3XYVeKGNWlSu3LgrMFz3/HYwf6Zri4xHgp/.FVXaNC.', '2005-07-24', 'nữ', 4, '2024-10-13', 'Active', '2025-12-10 16:30:56'),
(31, 'NV000031', NULL, NULL, 'Nguyễn Ngọc Trâm', '0946820517', '001147281504', 'thanh197203@gmail.com', '$2y$12$VeWNXhe47QCBwzyDb86ZW.GOPseugX2PNIR5emQm6KI1Q0AqVxuhq', '1982-07-09', 'nữ', 5, '2024-05-23', 'Active', '2025-12-10 16:33:24'),
(32, 'NV000032', NULL, NULL, 'Trần Thị Hồng Nhung', '0896375204', '001226739410', NULL, '$2y$12$TEjM9hHqEQHhRDeu.HaTuOcjDON4gZu5BJW.mGKWxwaqjHZuTY9fi', '2003-05-11', 'nữ', 4, '2024-08-26', 'Active', '2025-12-10 16:35:08'),
(33, 'NV000033', NULL, NULL, 'Lê Đức Hùng', '0352217255', '001246884575', NULL, '$2y$10$/NFaxz4g4T3x7AiWX7/k2Opn2rMAsijviGApBLXhFUAXRFueNgl/G', NULL, NULL, 13, NULL, 'Active', '2025-12-31 09:23:49');

--
-- Bẫy `users`
--
DELIMITER $$
CREATE TRIGGER `users_before_insert` BEFORE INSERT ON `users` FOR EACH ROW BEGIN
    DECLARE new_id BIGINT;
    SELECT last_id + 1 INTO new_id FROM id_counters WHERE table_name='users';
    SET NEW.code = CONCAT('NV', LPAD(new_id,6,'0'));
    UPDATE id_counters SET last_id=new_id WHERE table_name='users';
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `ingredient_available_stock`
--
DROP TABLE IF EXISTS `ingredient_available_stock`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `ingredient_available_stock`  AS SELECT `i`.`id` AS `ingredient_id`, `i`.`code` AS `code`, `i`.`name` AS `name`, `i`.`unit` AS `unit`, ifnull(sum(`im`.`quantity`),0) - ifnull(sum(`ex`.`quantity`),0) AS `available_qty`, max(`im`.`price`) AS `last_price` FROM ((`ingredient` `i` left join `import_details` `im` on(`im`.`ingredient_id` = `i`.`id`)) left join `export_details` `ex` on(`ex`.`ingredient_id` = `i`.`id`)) GROUP BY `i`.`id`, `i`.`code`, `i`.`name`, `i`.`unit` ;

-- --------------------------------------------------------

--
-- Cấu trúc cho view `product_available`
--
DROP TABLE IF EXISTS `product_available`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `product_available`  AS SELECT `p`.`id` AS `product_id`, `p`.`name` AS `product_name`, floor(min(ifnull(`stock`.`qty`,0) / `r`.`quantity`)) AS `available_qty`, sum(`r`.`quantity` * `i`.`price`) AS `cost_per_dish` FROM (((`product` `p` join `recipe` `r` on(`r`.`product_id` = `p`.`id`)) join `ingredient` `i` on(`i`.`id` = `r`.`ingredient_id`)) left join (select `inventory_log`.`ingredient_id` AS `ingredient_id`,sum(case when `inventory_log`.`type` = 'import' then `inventory_log`.`quantity` when `inventory_log`.`type` = 'export' then -`inventory_log`.`quantity` end) AS `qty` from `inventory_log` group by `inventory_log`.`ingredient_id`) `stock` on(`stock`.`ingredient_id` = `r`.`ingredient_id`)) GROUP BY `p`.`id`, `p`.`name` ;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `area`
--
ALTER TABLE `area`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Chỉ mục cho bảng `booking_item`
--
ALTER TABLE `booking_item`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `category_ingredient`
--
ALTER TABLE `category_ingredient`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `category_product`
--
ALTER TABLE `category_product`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `contact`
--
ALTER TABLE `contact`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `customer`
--
ALTER TABLE `customer`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Chỉ mục cho bảng `dining_table`
--
ALTER TABLE `dining_table`
  ADD PRIMARY KEY (`id`),
  ADD KEY `area_id` (`area_id`);

--
-- Chỉ mục cho bảng `export`
--
ALTER TABLE `export`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `export_details`
--
ALTER TABLE `export_details`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `id_counters`
--
ALTER TABLE `id_counters`
  ADD PRIMARY KEY (`table_name`);

--
-- Chỉ mục cho bảng `import`
--
ALTER TABLE `import`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Chỉ mục cho bảng `import_details`
--
ALTER TABLE `import_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `import_id` (`import_id`),
  ADD KEY `ingredient_id` (`ingredient_id`);

--
-- Chỉ mục cho bảng `ingredient`
--
ALTER TABLE `ingredient`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `category_id` (`category_id`);

--
-- Chỉ mục cho bảng `inventory_log`
--
ALTER TABLE `inventory_log`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `invoice`
--
ALTER TABLE `invoice`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `table_id` (`table_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `invoice_detail`
--
ALTER TABLE `invoice_detail`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_id` (`invoice_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Chỉ mục cho bảng `location`
--
ALTER TABLE `location`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Chỉ mục cho bảng `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `category_id` (`category_id`);

--
-- Chỉ mục cho bảng `promotion`
--
ALTER TABLE `promotion`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_promotion_location` (`location_id`),
  ADD KEY `fk_promotion_type` (`type_id`);

--
-- Chỉ mục cho bảng `promotion_type`
--
ALTER TABLE `promotion_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Chỉ mục cho bảng `recipe`
--
ALTER TABLE `recipe`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `ingredient_id` (`ingredient_id`);

--
-- Chỉ mục cho bảng `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `fk_users_location_code` (`location_code`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `area`
--
ALTER TABLE `area`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `booking`
--
ALTER TABLE `booking`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT cho bảng `booking_item`
--
ALTER TABLE `booking_item`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT cho bảng `category_ingredient`
--
ALTER TABLE `category_ingredient`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT cho bảng `category_product`
--
ALTER TABLE `category_product`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT cho bảng `contact`
--
ALTER TABLE `contact`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `customer`
--
ALTER TABLE `customer`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT cho bảng `dining_table`
--
ALTER TABLE `dining_table`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT cho bảng `export`
--
ALTER TABLE `export`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT cho bảng `export_details`
--
ALTER TABLE `export_details`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `import`
--
ALTER TABLE `import`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT cho bảng `import_details`
--
ALTER TABLE `import_details`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT cho bảng `ingredient`
--
ALTER TABLE `ingredient`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT cho bảng `inventory_log`
--
ALTER TABLE `inventory_log`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT cho bảng `invoice`
--
ALTER TABLE `invoice`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=98;

--
-- AUTO_INCREMENT cho bảng `invoice_detail`
--
ALTER TABLE `invoice_detail`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=246;

--
-- AUTO_INCREMENT cho bảng `location`
--
ALTER TABLE `location`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `product`
--
ALTER TABLE `product`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT cho bảng `promotion`
--
ALTER TABLE `promotion`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `promotion_type`
--
ALTER TABLE `promotion_type`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT cho bảng `recipe`
--
ALTER TABLE `recipe`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT cho bảng `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `dining_table`
--
ALTER TABLE `dining_table`
  ADD CONSTRAINT `dining_table_ibfk_1` FOREIGN KEY (`area_id`) REFERENCES `area` (`id`);

--
-- Các ràng buộc cho bảng `ingredient`
--
ALTER TABLE `ingredient`
  ADD CONSTRAINT `ingredient_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category_ingredient` (`id`);

--
-- Các ràng buộc cho bảng `invoice`
--
ALTER TABLE `invoice`
  ADD CONSTRAINT `invoice_ibfk_1` FOREIGN KEY (`table_id`) REFERENCES `dining_table` (`id`),
  ADD CONSTRAINT `invoice_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Các ràng buộc cho bảng `invoice_detail`
--
ALTER TABLE `invoice_detail`
  ADD CONSTRAINT `invoice_detail_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `invoice` (`id`),
  ADD CONSTRAINT `invoice_detail_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`);

--
-- Các ràng buộc cho bảng `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `product_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category_product` (`id`);

--
-- Các ràng buộc cho bảng `promotion`
--
ALTER TABLE `promotion`
  ADD CONSTRAINT `fk_promotion_location` FOREIGN KEY (`location_id`) REFERENCES `location` (`id`),
  ADD CONSTRAINT `fk_promotion_type` FOREIGN KEY (`type_id`) REFERENCES `promotion_type` (`id`);

--
-- Các ràng buộc cho bảng `recipe`
--
ALTER TABLE `recipe`
  ADD CONSTRAINT `recipe_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  ADD CONSTRAINT `recipe_ibfk_2` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredient` (`id`);

--
-- Các ràng buộc cho bảng `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_location_code` FOREIGN KEY (`location_code`) REFERENCES `location` (`code`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
