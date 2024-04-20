import type { User } from '@prisma/client';
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentUser = createParamDecorator(
	(data: keyof User, ctx: ExecutionContext) => {
		const request = ctx.switchToHttp().getRequest()
		const user = request.user

		console.log(data)
		console.log(user[data])
		console.log(user)
		
		return data ? user[data] : user
	}
)
