import wtforms
from wtforms.validators import length, email
from models import UserModel


class LoginForm(wtforms.Form):
    email = wtforms.StringField(validators=[email()])
    password = wtforms.StringField(validators=[length(min=6, max=20)])


class ReviewForm(wtforms.Form):
    user_id = wtforms.StringField(validators=[])
    rate = wtforms.StringField(validators=[])
    reviews = wtforms.StringField(validators=[])


class UpdateForm(wtforms.Form):
    user_name = wtforms.StringField(validators=[length(min=2, max=20)])
    user_img = wtforms.StringField(validators=[])
    password = wtforms.StringField(validators=[length(min=6, max=20)])


class RegisterForm(wtforms.Form):
    name = wtforms.StringField(validators=[length(min=2, max=20)])
    email = wtforms.StringField(validators=[email()])
    password = wtforms.StringField(validators=[length(min=6, max=20)])

    def validate_email(self, field):
        email = field.data
        user_model = UserModel.query.filter_by(email=email).first()
        if user_model:
            raise wtforms.ValidationError("Email already exists!")

