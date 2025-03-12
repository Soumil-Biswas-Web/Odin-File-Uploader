-- CreateTable
CREATE TABLE "messages" (
    "message_id" SERIAL NOT NULL,
    "username" VARCHAR(255),
    "message" TEXT,
    "timestamp" VARCHAR(255),

    CONSTRAINT "messages_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "users" (
    "username" VARCHAR(255),
    "first_name" VARCHAR(255),
    "last_name" VARCHAR(255),
    "password" VARCHAR(255),
    "ismember" BOOLEAN,
    "isadmin" BOOLEAN,
    "id" SERIAL NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ofu_Session" (
    "id" TEXT NOT NULL,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ofu_Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ofu_User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ofu_User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ofu_Folder" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentFolderId" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ofu_Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ofu_File" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "folderId" TEXT,
    "ownerId" TEXT NOT NULL,
    "publicId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ofu_File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ofu_ShareLink" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "folderId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ofu_ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ofu_Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ofu_Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ofu_Session_sid_key" ON "ofu_Session"("sid");

-- CreateIndex
CREATE UNIQUE INDEX "ofu_User_username_key" ON "ofu_User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "ofu_ShareLink_token_key" ON "ofu_ShareLink"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ofu_Profile_userId_key" ON "ofu_Profile"("userId");

-- AddForeignKey
ALTER TABLE "ofu_Folder" ADD CONSTRAINT "ofu_Folder_parentFolderId_fkey" FOREIGN KEY ("parentFolderId") REFERENCES "ofu_Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ofu_Folder" ADD CONSTRAINT "ofu_Folder_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "ofu_User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ofu_File" ADD CONSTRAINT "ofu_File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "ofu_Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ofu_File" ADD CONSTRAINT "ofu_File_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "ofu_User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ofu_ShareLink" ADD CONSTRAINT "ofu_ShareLink_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "ofu_Folder"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ofu_ShareLink" ADD CONSTRAINT "ofu_ShareLink_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "ofu_User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ofu_Profile" ADD CONSTRAINT "ofu_Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ofu_User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
