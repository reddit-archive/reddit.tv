SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

CREATE DATABASE IF NOT EXISTS `reddittv` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `reddittv`;

DROP TABLE IF EXISTS `channel`;
CREATE TABLE IF NOT EXISTS `channel` (
  `id`            int(11) unsigned NOT NULL AUTO_INCREMENT,
  `created_on`    datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'datetime created in database',
  `updated_on`    datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'datetime updated in database',
  `title`         varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '''''' COMMENT 'string title of channel',
  `feed`          varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '''''' COMMENT 'string feed for channel',
  `thumbnail_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '''''' COMMENT 'string thumbnail URL',
  `view_count`    int(11) NOT NULL DEFAULT '0' COMMENT 'integer total count of videos viewed',
  `skip_count`    int(11) NOT NULL DEFAULT '0' COMMENT 'integer total count of videos skipped',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=1 ;

DROP TABLE IF EXISTS `settings`;
CREATE TABLE IF NOT EXISTS `settings` (
  `id`                   int(11) unsigned NOT NULL AUTO_INCREMENT,
  `default_channels`     text COLLATE utf8mb4_unicode_ci COMMENT 'string JSON array of default channels ',
  `recommended_channels` text COLLATE utf8mb4_unicode_ci COMMENT 'string JSON array of recommended channels, max 8',
  `ads_start_at`         tinyint(3) unsigned DEFAULT '3' COMMENT 'integer index at which first ad is placed',
  `ads_show_every`       tinyint(3) unsigned DEFAULT '5' COMMENT 'integer show next ads every n videos',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=2 ;

INSERT INTO `settings` (`id`, `default_channels`, `recommended_channels`, `ads_start_at`, `ads_show_every`) VALUES
(1, '[]', '[]', 3, 5);

DROP TABLE IF EXISTS `sponsoredchannel`;
CREATE TABLE IF NOT EXISTS `sponsoredchannel` (
  `id`           int(11) unsigned NOT NULL AUTO_INCREMENT,
  `created_on`   datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'datetime created in database',
  `updated_on`   datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'datetime updated in database',
  `start_date`   datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'datetime campaign begins',
  `end_date`     datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'datetime campaign ends',
  `status`       tinyint(1) NOT NULL DEFAULT '0' COMMENT 'integer 0 = ''draft'' | 1 = ''ready'' / ''active'' | 2 = ''ended'' | 3 = ''deleted''',
  `image_url`    text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'string image URL for creative',
  `sponsor_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'string sponsor name',
  `title`        varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'string title (optional)',
  `autoplay`     tinyint(1) NOT NULL DEFAULT '0' COMMENT 'boolean autoplay videos',
  `video_list`   text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'string JSON representation of videos in channel',
  `view_count`   int(11) NOT NULL DEFAULT '0' COMMENT 'integer total count of views',
  `view_target`  int(11) NOT NULL DEFAULT '0' COMMENT 'integer number of times viewed',
  `skip_count`   int(11) NOT NULL DEFAULT '0' COMMENT 'integer number of times skipped',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=1 ;

DROP TABLE IF EXISTS `sponsoredskin`;
CREATE TABLE IF NOT EXISTS `sponsoredskin` (
  `id`           int(11) unsigned NOT NULL AUTO_INCREMENT,
  `created_on`   datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'datetime created in database',
  `updated_on`   datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'datetime updated in database',
  `start_date`   datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'datetime campaign begins',
  `end_date`     datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'datetime campaign ends',
  `status`       tinyint(1) NOT NULL DEFAULT '0' COMMENT 'integer 0 = ''draft'' | 1 = ''ready'' / ''active'' | 2 = ''ended'' | 3 = ''deleted''',
  `position`     varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'video_background' COMMENT 'string location of placement: ''header'' ''video_background'' ''channel_background''',
  `image_url`    text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'string image URL for creative',
  `sponsor_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'string sponsor name',
  `title`        varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'string title (optional)',
  `view_count`   int(11) NOT NULL DEFAULT '0' COMMENT 'integer number of times viewed',
  `view_target`  int(11) NOT NULL DEFAULT '0' COMMENT 'integer goal for final view count',
  `cpm`          float NOT NULL DEFAULT '0' COMMENT 'float dollar value for CPM (optional)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=1 ;

DROP TABLE IF EXISTS `sponsoredvideo`;
CREATE TABLE IF NOT EXISTS `sponsoredvideo` (
  `id`               int(11) unsigned NOT NULL AUTO_INCREMENT,
  `created_on`       datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'datetime created in database',
  `updated_on`       datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'datetime updated in database',
  `start_date`       datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'datetime campaign begins',
  `end_date`         datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'datetime campaign ends',
  `status`           tinyint(1) NOT NULL DEFAULT '0' COMMENT 'integer 0 = ''draft'' | 1 = ''ready'' / ''active'' | 2 = ''ended'' | 3 = ''deleted''',
  `video_url`        text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'string location of video',
  `video_embed_code` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'string video embed code',
  `image_url`        text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'string thumbnail URL',
  `sponsor_name`     varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '''''' COMMENT 'string sponsor name',
  `title`            varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '''''' COMMENT 'string title (optional)',
  `view_count`       int(11) NOT NULL DEFAULT '0' COMMENT 'integer number of times viewed',
  `view_target`      int(11) NOT NULL DEFAULT '0' COMMENT 'integer goal for final view count',
  `skip_count`       int(11) NOT NULL DEFAULT '0' COMMENT 'integer number of times skipped',
  `cpm`              float NOT NULL DEFAULT '0' COMMENT 'float dollar value for CPM (optional)',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=1 ;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
