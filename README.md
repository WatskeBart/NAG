# NAG (Not A Game)

NAG is to track someone's missteps. Each misstep will decrease their "healthbar" and a message about the misstep can be recorded.

# Run NAG

Clone this repository:
`git clone https://github.com/WatskeBart/NAG.git`

Inside the NAG directory (`cd NAG`), run:
`npm install`

After the installation is finished, run:
`npm start`

Open the page in your browser: [http://localhost:3000](http://localhost:3000)

# Build NAG

Clone this repository:
`git clone https://github.com/WatskeBart/NAG.git`

Inside the NAG directory (`cd NAG`), run:
`docker build -t nag .`

Run the container:
`docker run -p 3000:3000 localhost/nag:latest`

Open the page in your browser: [http://localhost:3000](http://localhost:3000)