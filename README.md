# Rating and Review (Microservice API)

API microservice solution for an E-commerce legacy API that handles the rating and review portion of the website.

# Technology

API microservice was built with Express.js with PostgreSQL as the relational database choice. Designed to remove inefficiencies at the most basic level with <kbd>Get</kbd> requests factored down to make only a single query on database. Elimination of having artifacts of partial information in datbase by use of postgreSQL <kbd>transactions</kbd>.

# Designed To Scale

K6, loader.io, and New Relic were used for stress testing and identification of potential bottlenecks.

Deployed on Amazon EC2 instance with 3 servers and NGINX as a load balancer and configured for caching.

