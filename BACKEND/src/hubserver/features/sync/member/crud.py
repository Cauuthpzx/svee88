from fastcrud import FastCRUD

from .model import Member
from .schema import MemberCreateInternal, MemberDelete, MemberRead, MemberUpdate, MemberUpdateInternal

CRUDMember = FastCRUD[Member, MemberCreateInternal, MemberUpdate, MemberUpdateInternal, MemberDelete, MemberRead]
crud_members = CRUDMember(Member)
