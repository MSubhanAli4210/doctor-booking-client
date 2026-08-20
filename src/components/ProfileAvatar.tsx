interface ProfileAvatarProps {
  src?: string;
  name?: string;
  className?: string;
  textClassName?: string;
}

export default function ProfileAvatar({
  src,
  name = "User",
  className = "h-12 w-12 rounded-full",
  textClassName = "text-sm",
}: ProfileAvatarProps) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${className} shrink-0 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${className} ${textClassName} flex shrink-0 items-center justify-center bg-gradient-to-br from-blue-600 to-cyan-500 font-bold text-white`}
    >
      {initials || "U"}
    </div>
  );
}