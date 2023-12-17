from flask import Flask, request, jsonify,make_response
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_restful import Resource, Api
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_cors import CORS

# Database configuration
app = Flask(__name__)
CORS(app)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///quiz.db'
db = SQLAlchemy(app)

migrate = Migrate(app, db) 

# JWT configuration
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
jwt = JWTManager(app)

# Bcrypt configuration
bcrypt = Bcrypt(app)


# Models
class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question_text = db.Column(db.String(255), nullable=False)
    language = db.Column(db.String(20), nullable=False)
    options = db.relationship('Option', backref='question', lazy=True)

class Option(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    option_text = db.Column(db.String(255), nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('question.id'), nullable=False)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    scores = db.relationship('Score', backref='user', lazy=True)

    def hash_password(self):
        self.password = bcrypt.generate_password_hash(self.password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    score_value = db.Column(db.Integer, nullable=False)


# API resources
api = Api(app)

class Quiz(Resource):
    @jwt_required()
    def post(self):
        data = request.get_json()
        language = data.get('language')
        print(language)
        questions = Question.query.filter_by(language=language).all()

        return jsonify(questions = [{
        'id': q.id,
        'question_text': q.question_text,
        'language': q.language,
        'options': [
            {
                'id': option.id,
                'option_text': option.option_text,
                'is_correct': option.is_correct
            }
            for option in q.options
        ]
    }
    for q in questions
]
)

class Languages(Resource):
    def get(self):
        languages = set([q.language for q in Question.query.all()])
        return jsonify(languages=list(languages))

        

class Leaderboard(Resource):
    def get(self):
        try:
            # Fetch the top 10 scores from the database
            # Fetch the top 10 scores from the database
            top_scores = Score.query.order_by(Score.score_value.desc()).limit(10).all()

            # Ensure that all attributes are JSON-serializable
            leaderboard = [{'username': score.user.username, 'score': int(score.score_value)} for score in top_scores]

            # Serialize to JSON
            return make_response(jsonify(leaderboard=leaderboard), 200)

            
        except Exception as e:
            return {'message': f'Error: {str(e)}'}, 500




class ScoreResource(Resource):
    @jwt_required()
    def post(self):
        print('request is coning\n')
        data = request.get_json()
        current_user = get_jwt_identity()

        # Validate input
        score_value = data.get('score')
        print(score_value)
        if not score_value:
            return jsonify(message="Score is required"), 400

        # Create a new score record
        new_score = Score(user_id=current_user, score_value=score_value)
        db.session.add(new_score)
        db.session.commit()

        return make_response(jsonify(message="Score posted successfully"), 200)


class Register(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')
        print(data)

        # Validate input
        if not username or not password:
            return {'message': "Username and password are required"}, 400

        # Check if the username already exists
        if User.query.filter_by(username=username).first():
            return {'message': "Username already exists"}, 409

        # Create a new user
        new_user = User(username=username, password=password)
        new_user.hash_password()  # Hash the password before storing
        db.session.add(new_user)
        db.session.commit()

        return {'message': "User registered successfully"}, 200


class Login(Resource):
    def post(self):
        data = request.get_json()
        username = data.get('username')
        password = data.get('password')

        # Validate input
        if not username or not password:
            return {"message":"Username and password are required"}, 400

        # Check if the user exists
        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            access_token = create_access_token(identity=user.id)
            print(access_token)
            
            return {'token': str(access_token)}, 200
        else:
            
            return {"message":"Invalid login credentials"}, 401

# Add resources to API
api.add_resource(ScoreResource, '/score')
api.add_resource(Leaderboard, '/leaderboard')
api.add_resource(Languages, '/languages')
api.add_resource(Quiz, '/quiz')
api.add_resource(Register, '/register')
api.add_resource(Login, '/login')

# Run the Flask app
if __name__== '_main_':
    with app.app_context():
        db.create_all()
    app.run(debug=True)