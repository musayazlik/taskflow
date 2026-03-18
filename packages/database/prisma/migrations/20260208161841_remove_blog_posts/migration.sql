-- DropForeignKey
ALTER TABLE "blog_post" DROP CONSTRAINT IF EXISTS "blog_post_authorId_fkey";

-- DropIndex
DROP INDEX IF EXISTS "blog_post_slug_key";
DROP INDEX IF EXISTS "blog_post_authorId_idx";
DROP INDEX IF EXISTS "blog_post_status_idx";
DROP INDEX IF EXISTS "blog_post_publishedAt_idx";
DROP INDEX IF EXISTS "blog_post_createdAt_idx";

-- DropTable
DROP TABLE IF EXISTS "blog_post";
