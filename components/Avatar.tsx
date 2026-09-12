import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"



const UserAvatar = () => {
  return (
    <Avatar>
      <AvatarImage
        src="https://github.com/shadcn.png"
        alt="@shadcn"
        className="grayscale"
      />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  )
}

export default UserAvatar;
