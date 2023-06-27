// Change name of service and port as per requirement.

docker build . -t product-service
docker run -it -p 3300:3300 order-service:latest


docker login cloudserviceregistry.azurecr.io
docker tag order-service:latest cloudserviceregistry.azurecr.io/order-service:latest
docker push  cloudserviceregistry.azurecr.io/order-service:latest
